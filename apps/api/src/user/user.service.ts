import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { FoldersService } from "../folders/folders.service";
import { MailerService } from "../mailer/mailer.service";
import { RepositoriesService } from "../repositories/repositories.service";

import { ActivationToken } from "./entities/activation-token.entity";
import { EmailConfirmation } from "./entities/email-confirmation.entity";
import { PasswordReset } from "./entities/password-reset.entity";
import { User } from "./entities/user.entity";

import { ChangeUserPasswordPayload } from "./payloads/change-user-password.payload";
import { CreateEmailConfirmationPayload } from "./payloads/create-email-confirmation.payload";
import { CreateUserPayload } from "./payloads/create-user.payload";

import {
  EmailConflictException,
  IncorrectPasswordException,
  InvalidActivationTokenException,
  InvalidEmailConfirmationTokenException,
  InvalidPasswordResetTokenException,
  UsernameConflictException
} from "./user.exceptions";

@Injectable()
export class UserService {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly mailerService: MailerService,
    private readonly repositoriesService: RepositoriesService
  ) {}

  private get activationTokenRepository(): EntityRepository<ActivationToken> {
    return this.repositoriesService.getRepository(ActivationToken);
  }

  private get emailConfirmationRepository(): EntityRepository<EmailConfirmation> {
    return this.repositoriesService.getRepository(EmailConfirmation);
  }

  private get passwordResetRepository(): EntityRepository<PasswordReset> {
    return this.repositoriesService.getRepository(PasswordReset);
  }

  private get userRepository(): EntityRepository<User> {
    return this.repositoriesService.getRepository(User);
  }

  /**
   * Removes activation token from user to "activate" it
   */
  async activate(token: string): Promise<User> {
    const activation = await this.activationTokenRepository.findOne({
      token
    });

    if (!activation || !activation.valid) {
      throw new InvalidActivationTokenException();
    }

    activation.user.activatedAt = new Date();

    await this.activationTokenRepository.remove(activation);
    await this.userRepository.persistAndFlush(activation.user);

    return activation.user;
  }

  /**
   * Change the password of a user and notify user through email
   */
  async changePassword(payload: ChangeUserPasswordPayload): Promise<User> {
    const { newPassword, oldPassword, user } = payload;

    if (!(await user.comparePassword(oldPassword))) {
      throw new IncorrectPasswordException();
    }

    user.password = newPassword;

    await this.userRepository.persistAndFlush(user);

    await this.notifyPasswordChange(user);

    return user;
  }

  /**
   * Change the user's email address linked to the email confirmation token
   */
  async confirmEmail(token: string): Promise<void> {
    const confirmation = await this.emailConfirmationRepository.findOne({
      deletedAt: null,
      token
    });

    if (!confirmation || !confirmation.valid) {
      throw new InvalidEmailConfirmationTokenException();
    }

    const isEmailTaken = await this.userRepository.findOne({
      email: confirmation.newEmail
    });

    if (isEmailTaken) {
      throw new EmailConflictException();
    }

    confirmation.deletedAt = new Date();
    confirmation.user.email = confirmation.newEmail;

    await this.emailConfirmationRepository.persistAndFlush(confirmation);
    await this.userRepository.persistAndFlush(confirmation.user);

    await this.notifyEmailChange(confirmation.user, confirmation);
  }

  /**
   * Create a new user and email them with an activation link
   */
  async create(payload: CreateUserPayload): Promise<User> {
    const isEmailTaken = await this.userRepository.findOne({
      email: payload.email
    });

    if (isEmailTaken) {
      throw new EmailConflictException();
    }

    const isUsernameTaken = await this.userRepository.findOne({
      username: payload.username
    });

    if (isUsernameTaken) {
      throw new UsernameConflictException();
    }

    const user = this.userRepository.create(payload);

    await this.userRepository.persistAndFlush(user);

    const activation = this.activationTokenRepository.create({ user });

    await this.activationTokenRepository.persistAndFlush(activation);

    await this.foldersService.create({ name: "/", user });

    await this.sendActivationToken(activation);

    return user;
  }

  /**
   * Create an email confirmation and send the token to the user's new email address
   */
  async createEmailConfirmation(payload: CreateEmailConfirmationPayload): Promise<void> {
    const { newEmail, password, user } = payload;

    if (!(await user.comparePassword(password))) {
      throw new IncorrectPasswordException();
    }

    const emailTaken = await this.userRepository.findOne({
      email: newEmail
    });

    if (emailTaken) {
      throw new EmailConflictException();
    }

    const confirmation = this.emailConfirmationRepository.create(payload);

    await this.emailConfirmationRepository.persistAndFlush(confirmation);

    await this.sendEmailConfirmation(user, confirmation);
  }

  /**
   * Create a password reset entity and email the reset token to the user
   */
  async createPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });

    if (!user || !user.activated || user.deleted) {
      return;
    }

    const reset = this.passwordResetRepository.create({ user });

    await this.passwordResetRepository.persistAndFlush(reset);

    await this.sendPasswordResetToken(reset);
  }

  /**
   * Delete a user and all their files if the provided password is correct
   */
  async deleteOneWithPassword(user: User, password: string): Promise<User> {
    if (!(await user.comparePassword(password))) {
      throw new IncorrectPasswordException();
    }

    user.activatedAt = undefined;
    user.deletedAt = new Date();

    await this.userRepository.persistAndFlush(user);

    await this.foldersService.deleteOne({
      deleteRoot: true,
      folder: {
        parent: null,
        user
      }
    });

    return user;
  }

  /**
   * Find a user or returns null if it does not exist
   */
  findOne(conditions: FilterQuery<User>): Promise<User | null> {
    return this.userRepository.findOne(conditions);
  }

  /**
   * Reset a user's password with a reset token and notify user through email
   */
  // TODO: Delete all user sessions
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.passwordResetRepository.findOne({
      deletedAt: null,
      token
    });

    if (!reset || !reset.valid) {
      throw new InvalidPasswordResetTokenException();
    }

    reset.user.password = newPassword;

    await this.passwordResetRepository.nativeDelete({ user: reset.user });
    await this.userRepository.persistAndFlush(reset.user);

    await this.notifyPasswordChange(reset.user);
  }

  // TODO: Delete all user sessions
  async revertEmailChange(token: string): Promise<void> {
    const confirmation = await this.emailConfirmationRepository.findOne({ token });

    if (!confirmation || !confirmation.valid) {
      throw new InvalidEmailConfirmationTokenException();
    }

    confirmation.user.email = confirmation.oldEmail;

    await this.emailConfirmationRepository.nativeDelete({ user: confirmation.user });
    await this.userRepository.persistAndFlush(confirmation.user);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async deleteExpiredTokens(): Promise<void> {
    await Promise.all([
      this.emailConfirmationRepository.nativeDelete({
        expiresAt: {
          $lte: "now()"
        }
      }),

      this.passwordResetRepository.nativeDelete({
        expiresAt: {
          $lte: "now()"
        }
      })
    ]);
  }

  private notifyEmailChange(user: User, confirmation: EmailConfirmation): Promise<void> {
    return this.mailerService.renderAndSend(
      "email-changed",
      {
        subject: "Your email has been changed.",
        to: confirmation.oldEmail
      },
      {
        date: new Date().toUTCString(),
        newEmail: user.email,
        url: this.mailerService.buildURL(`/revert-email-change/${confirmation.token}`),
        username: user.username
      }
    );
  }

  private notifyPasswordChange(user: User): Promise<void> {
    return this.mailerService.renderAndSend(
      "password-changed",
      {
        subject: "Your password has been changed.",
        to: user.email
      },
      {
        date: new Date().toUTCString(),
        url: this.mailerService.buildURL("/forgot-password"),
        username: user.username
      }
    );
  }

  private sendActivationToken(activation: ActivationToken): Promise<void> {
    return this.mailerService.renderAndSend(
      "activate-account",
      {
        subject: "Activate your account.",
        to: activation.user.email
      },
      {
        url: this.mailerService.buildURL(`/user/activate/${activation.token}`),
        username: activation.user.username
      }
    );
  }

  private sendEmailConfirmation(user: User, confirmation: EmailConfirmation): Promise<void> {
    return this.mailerService.renderAndSend(
      "activate-account",
      {
        subject: "Please confirm your email address.",
        to: user.email
      },
      {
        newEmail: user.email,
        url: this.mailerService.buildURL(`/user/confirm-email/${confirmation.token}`),
        username: user.username
      }
    );
  }

  private sendPasswordResetToken(reset: PasswordReset): Promise<void> {
    return this.mailerService.renderAndSend(
      "activate-account",
      {
        subject: "Password reset requested.",
        to: reset.user.email
      },
      {
        url: this.mailerService.buildURL(`/user/reset-password/${reset.token}`),
        username: reset.user.username
      }
    );
  }
}
