import { Cron, CronExpression } from "@nestjs/schedule";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { MailerService } from "../mailer/mailer.service";
import { RepositoriesService } from "../repositories/repositories.service";

import { EmailConfirmation } from "./entities/email-confirmation.entity";
import { PasswordReset } from "./entities/password-reset.entity";
import { User } from "./entities/user.entity";

import {
  EmailConflictException,
  InvalidEmailConfirmationTokenException,
  InvalidPasswordResetTokenException,
  UsernameConflictException
} from "./user.exceptions";

@Injectable()
export class UserService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly mailerService: MailerService,
    private readonly repositoriesService: RepositoriesService
  ) {}

  private get emailConfirmationRepository(): EntityRepository<EmailConfirmation> {
    return this.repositoriesService.getRepository(EmailConfirmation);
  }

  private get passwordResetRepository(): EntityRepository<PasswordReset> {
    return this.repositoriesService.getRepository(PasswordReset);
  }

  private get userRepository(): EntityRepository<User> {
    return this.repositoriesService.getRepository(User);
  }

  async changePassword(user: User, newPassword: string): Promise<User> {
    user.password = newPassword;

    await this.userRepository.persistAndFlush(user);

    await this.notifyPasswordChange(user);

    return user;
  }

  async confirmEmail(token: string): Promise<void> {
    const confirmation = await this.emailConfirmationRepository.findOne({ token });

    if (!confirmation || confirmation.user.isDeleted) {
      throw new InvalidEmailConfirmationTokenException();
    }

    const emailTaken = await this.userRepository.findOne({
      deletedAt: null,
      email: confirmation.newEmail
    });

    if (emailTaken) {
      throw new EmailConflictException();
    }

    confirmation.deletedAt = new Date();
    confirmation.user.email = confirmation.newEmail;

    await this.emailConfirmationRepository.persistAndFlush(confirmation);
    await this.userRepository.persistAndFlush(confirmation.user);

    await this.notifyEmailChange(confirmation.user, confirmation);
  }

  async create(email: string, password: string, username: string): Promise<User> {
    const emailTaken = await this.userRepository.findOne({
      deletedAt: null,
      email
    });

    if (emailTaken) {
      throw new EmailConflictException();
    }

    const usernameTaken = await this.userRepository.findOne({
      deletedAt: null,
      username
    });

    if (usernameTaken) {
      throw new UsernameConflictException();
    }

    const user = new User();

    user.email = email;
    user.password = password;
    user.username = username;

    await this.userRepository.persistAndFlush(user);

    await this.eventEmitter.emitAsync("user.created", user);

    return user;
  }

  async createEmailConfirmation(user: User, newEmail: string): Promise<void> {
    const emailTaken = await this.userRepository.findOne({
      deletedAt: null,
      email: newEmail
    });

    if (emailTaken) {
      throw new EmailConflictException();
    }

    const confirmation = new EmailConfirmation();

    confirmation.newEmail = newEmail;
    confirmation.oldEmail = user.email;
    confirmation.user = user;

    await this.emailConfirmationRepository.persistAndFlush(confirmation);

    await this.sendEmailConfirmation(user, confirmation);
  }

  async createPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });

    if (!user || user.isDeleted) {
      return;
    }

    const reset = new PasswordReset();

    reset.user = user;

    await this.passwordResetRepository.persistAndFlush(reset);

    await this.sendPasswordResetToken(reset);
  }

  async deleteOne(user: User): Promise<User> {
    await Promise.all([
      this.emailConfirmationRepository.nativeDelete({ user }),
      this.passwordResetRepository.nativeDelete({ user })
    ]);

    // Use emitAsync to make sure all listeners ran without errors
    await this.eventEmitter.emitAsync("user.deleted", user);

    user.deletedAt = new Date();

    await this.userRepository.persistAndFlush(user);

    return user;
  }

  async findOne(filter: FilterQuery<User>): Promise<User | null> {
    return this.userRepository.findOne(filter);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.passwordResetRepository.findOne({ token });

    if (!reset || reset.user.isDeleted) {
      throw new InvalidPasswordResetTokenException();
    }

    reset.user.password = newPassword;

    await Promise.all([
      this.emailConfirmationRepository.nativeDelete({ user: reset.user }),
      this.passwordResetRepository.nativeDelete({ user: reset.user })
    ]);

    await this.userRepository.persistAndFlush(reset.user);

    await this.notifyPasswordChange(reset.user);
  }

  async revertEmailChange(token: string): Promise<void> {
    const confirmation = await this.emailConfirmationRepository.findOne({ token });

    if (!confirmation || confirmation.user.isDeleted) {
      throw new InvalidEmailConfirmationTokenException();
    }

    confirmation.user.email = confirmation.oldEmail;

    await this.emailConfirmationRepository.nativeDelete({ user: confirmation.user });
    await this.userRepository.persistAndFlush(confirmation.user);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async removeExpiredTokens(): Promise<void> {
    await Promise.all([
      this.emailConfirmationRepository.nativeDelete({
        expiresAt: {
          $lte: new Date()
        }
      }),

      this.passwordResetRepository.nativeDelete({
        expiresAt: {
          $lte: new Date()
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
