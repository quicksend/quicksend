import { URL } from "url";

import { ConfigType } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Inject, Injectable } from "@nestjs/common";

import { FindConditions, FindOneOptions } from "typeorm";

import { MailerService } from "@quicksend/nestjs-mailer";

import { FoldersService } from "../folders/folders.service";
import { TransactionService } from "../transaction/transaction.service";

import { EmailConfirmationEntity } from "./entities/email-confirmation.entity";
import { PasswordResetEntity } from "./entities/password-reset.entity";
import { UserEntity } from "./user.entity";

import {
  CantFindUserException,
  EmailConflictException,
  IncorrectPasswordException,
  InvalidEmailConfirmationTokenException,
  InvalidPasswordResetTokenException,
  UsernameConflictException
} from "./user.exceptions";

import { httpNamespace } from "../config/config.namespaces";

import { generateRandomString } from "../common/utils/generate-random-string.util";
import { renderEmail } from "../common/utils/render-email.util";

@Injectable()
export class UserService {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly mailerService: MailerService,
    private readonly transactionService: TransactionService,

    @Inject(httpNamespace.KEY)
    private readonly httpConfig: ConfigType<typeof httpNamespace>
  ) {}

  private get emailConfirmationRepository() {
    return this.transactionService.getRepository(EmailConfirmationEntity);
  }

  private get passwordResetRepository() {
    return this.transactionService.getRepository(PasswordResetEntity);
  }

  private get userRepository() {
    return this.transactionService.getRepository(UserEntity);
  }

  /**
   * Removes activation token from user to "activate" it
   */
  async activate(token: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      activationToken: token
    });

    if (!user || user.activated) {
      throw new CantFindUserException();
    }

    user.activationToken = null;

    return this.userRepository.save(user);
  }

  /**
   * Change the password of a user and notify user through email
   */
  async changePassword(
    user: UserEntity,
    oldPassword: string,
    newPassword: string
  ): Promise<UserEntity> {
    if (!(await user.comparePassword(oldPassword))) {
      throw new IncorrectPasswordException();
    }

    user.password = newPassword;

    await this.userRepository.save(user);

    await this.notifyPasswordChange(user);

    return user;
  }

  /**
   * Create an email confirmation and send the token to the user's new email address
   */
  async createEmailConfirmation(
    user: UserEntity,
    newEmail: string,
    password: string
  ): Promise<void> {
    if (!(await user.comparePassword(password))) {
      throw new IncorrectPasswordException();
    }

    const isEmailTaken = await this.userRepository.findOne(
      { email: newEmail },
      { withDeleted: true }
    );

    if (isEmailTaken) {
      throw new EmailConflictException();
    }

    const confirmation = this.emailConfirmationRepository.create({
      newEmail,
      oldEmail: user.email,
      user
    });

    await this.emailConfirmationRepository.save(confirmation);

    await this.sendEmailConfirmation(user, confirmation);
  }

  /**
   * Create a password reset entity and email the reset token to the user
   */
  async createPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });

    if (!user || !user.activated) {
      return;
    }

    const reset = this.passwordResetRepository.create({ user });

    await this.passwordResetRepository.save(reset);

    await this.sendPasswordResetToken(reset);
  }

  /**
   * Change the user's email address linked to the email confirmation token
   */
  async confirmEmail(token: string): Promise<void> {
    const confirmation = await this.emailConfirmationRepository.findOne({
      token
    });

    if (!confirmation || !confirmation.user.activated) {
      throw new InvalidEmailConfirmationTokenException();
    }

    if (confirmation.expired) {
      throw new InvalidEmailConfirmationTokenException();
    }

    const isEmailTaken = await this.userRepository.findOne(
      { email: confirmation.newEmail },
      { withDeleted: true }
    );

    if (isEmailTaken) {
      throw new EmailConflictException();
    }

    confirmation.user.email = confirmation.newEmail;

    await this.userRepository.save(confirmation.user);

    await this.emailConfirmationRepository.softDelete({
      user: confirmation.user
    });

    await this.notifyEmailChange(confirmation.user, confirmation);
  }

  /**
   * Create a new user and email them with an activation link
   */
  async create(
    email: string,
    password: string,
    username: string
  ): Promise<UserEntity> {
    const isEmailTaken = await this.userRepository.findOne(
      { email },
      { withDeleted: true }
    );

    if (isEmailTaken) {
      throw new EmailConflictException();
    }

    const isUsernameTaken = await this.userRepository.findOne(
      { username },
      { withDeleted: true }
    );

    if (isUsernameTaken) {
      throw new UsernameConflictException();
    }

    const activationToken = await generateRandomString(16);

    const user = this.userRepository.create({
      activationToken,
      email,
      password,
      username
    });

    await this.userRepository.save(user);

    await this.foldersService.create("/", null, user);

    await this.sendActivationToken(user);

    return user;
  }

  /**
   * Delete a user and all their files if the provided password is correct
   */
  async deleteOne(user: UserEntity, password: string): Promise<void> {
    if (!(await user.comparePassword(password))) {
      throw new IncorrectPasswordException();
    }

    // TODO: Delete all of user's data

    user.activationToken = null;
    user.password = null as never; // force the password to be null

    await this.userRepository.save(user);
    await this.userRepository.softDelete({ id: user.id });
  }

  /**
   * Find a user or returns undefined if it does not exist
   */
  findOne(
    conditions: FindConditions<UserEntity>,
    options?: FindOneOptions<UserEntity>
  ): Promise<UserEntity | undefined> {
    return this.userRepository.findOne(conditions, options);
  }

  /**
   * Reset a user's password with a reset token and notify user through email
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.passwordResetRepository.findOne({ token });

    if (!reset || !reset.user.activated) {
      throw new InvalidPasswordResetTokenException();
    }

    if (reset.expired) {
      throw new InvalidPasswordResetTokenException();
    }

    reset.user.password = newPassword;

    await this.userRepository.save(reset.user);

    await this.passwordResetRepository.delete({ user: reset.user });

    // TODO: Delete all user sessions

    await this.notifyPasswordChange(reset.user);
  }

  async revertEmailChange(token: string): Promise<void> {
    const confirmation = await this.emailConfirmationRepository.findOne(
      { token },
      { withDeleted: true }
    );

    if (!confirmation || !confirmation.user.activated) {
      throw new InvalidPasswordResetTokenException();
    }

    if (confirmation.expired) {
      throw new InvalidPasswordResetTokenException();
    }

    confirmation.user.email = confirmation.oldEmail;

    await this.userRepository.save(confirmation.user);

    await this.emailConfirmationRepository.delete({
      user: confirmation.user
    });

    // TODO: Delete all user sessions
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async deleteExpiredTokens(): Promise<void> {
    await Promise.all([
      this.emailConfirmationRepository
        .createQueryBuilder()
        .delete()
        .where("now() >= expiresAt")
        .execute(),

      this.passwordResetRepository
        .createQueryBuilder()
        .delete()
        .where("now() >= expiresAt")
        .execute()
    ]);
  }

  private async notifyEmailChange(
    user: UserEntity,
    confirmation: EmailConfirmationEntity
  ): Promise<void> {
    const resetEmailUrl = new URL(
      `/revert-email-change/${confirmation.token}`,
      this.httpConfig.frontendUrl.toString()
    );

    const email = await renderEmail("email-changed", {
      date: new Date().toUTCString(),
      newEmail: user.email,
      url: resetEmailUrl,
      username: user.username
    });

    await this.mailerService.send({
      html: email,
      subject: "Your email has been changed",
      to: confirmation.oldEmail
    });
  }

  private async notifyPasswordChange(user: UserEntity): Promise<void> {
    const resetPasswordUrl = new URL(
      "/forgot-password",
      this.httpConfig.frontendUrl.toString()
    );

    const email = await renderEmail("password-changed", {
      date: new Date().toUTCString(),
      url: resetPasswordUrl.href,
      username: user.username
    });

    await this.mailerService.send({
      html: email,
      subject: "Your password has been changed",
      to: user.email
    });
  }

  private async sendActivationToken(user: UserEntity): Promise<void> {
    const activateUserUrl = new URL(
      `/user/activate/${user.activationToken}`,
      this.httpConfig.frontendUrl.toString()
    );

    const email = await renderEmail("activate-account", {
      url: activateUserUrl.href,
      username: user.username
    });

    await this.mailerService.send({
      html: email,
      subject: "Activate your account",
      to: user.email
    });
  }

  private async sendEmailConfirmation(
    user: UserEntity,
    confirmation: EmailConfirmationEntity
  ) {
    const confirmationUrl = new URL(
      `/user/confirm-email/${confirmation.token}`,
      this.httpConfig.frontendUrl.toString()
    );

    const email = await renderEmail("email-confirmation", {
      newEmail: user.email,
      url: confirmationUrl.href,
      username: user.username
    });

    await this.mailerService.send({
      html: email,
      subject: "Please confirm your email address",
      to: confirmation.newEmail
    });
  }

  private async sendPasswordResetToken(
    reset: PasswordResetEntity
  ): Promise<void> {
    const resetPasswordUrl = new URL(
      `/user/reset-password/${reset.token}`,
      this.httpConfig.frontendUrl.toString()
    );

    const email = await renderEmail("reset-password", {
      url: resetPasswordUrl.href,
      username: reset.user.username
    });

    await this.mailerService.send({
      html: email,
      subject: "Password reset requested",
      to: reset.user.email
    });
  }
}
