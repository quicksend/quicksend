import argon2 from "argon2";

import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";

import { BrokerService } from "../broker/broker.service";
import { EntityManagerService } from "../entity-manager/entity-manager.service";

import { EmailConfirmation } from "./entities/email-confirmation.entity";
import { PasswordReset } from "./entities/password-reset.entity";
import { User } from "./entities/user.entity";

import { UserEvent } from "./events/user.event";

import {
  EmailConflictException,
  IncorrectOldPassword,
  InvalidEmailConfirmationTokenException,
  InvalidPasswordResetTokenException,
  UsernameConflictException,
  UserNotFoundException
} from "./users.exceptions";

@Injectable()
export class UsersService {
  constructor(
    private readonly brokerService: BrokerService,
    private readonly entityManagerService: EntityManagerService
  ) {}

  private get emailConfirmationRepository(): EntityRepository<EmailConfirmation> {
    return this.entityManagerService.getRepository(EmailConfirmation);
  }

  private get passwordResetRepository(): EntityRepository<PasswordReset> {
    return this.entityManagerService.getRepository(PasswordReset);
  }

  private get userRepository(): EntityRepository<User> {
    return this.entityManagerService.getRepository(User);
  }

  async changePassword(
    filter: FilterQuery<User>,
    options: {
      newPassword: string;
      oldPassword: string;
    }
  ): Promise<void> {
    const user = await this.userRepository.findOne(filter);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!(await argon2.verify(user.password, options.oldPassword))) {
      throw new IncorrectOldPassword();
    }

    user.password = options.newPassword;

    await this.userRepository.persistAndFlush(user);

    await this.brokerService.emitAsync(UserEvent.PASSWORD_CHANGED, {
      newPassword: options.newPassword,
      user
    });
  }

  async confirmEmail(token: string): Promise<void> {
    const confirmation = await this.emailConfirmationRepository.findOne({
      token
    });

    if (!confirmation) {
      throw new InvalidEmailConfirmationTokenException();
    }

    const emailTaken = await this.userRepository.findOne(
      { email: confirmation.newEmail },
      { filters: false }
    );

    if (emailTaken) {
      throw new EmailConflictException();
    }

    confirmation.user.email = confirmation.newEmail;

    await this.emailConfirmationRepository.removeAndFlush(confirmation);

    await this.userRepository.persistAndFlush(confirmation.user);

    await this.brokerService.emitAsync(UserEvent.EMAIL_CONFIRMED, {
      confirmed: confirmation
    });
  }

  async create(email: string, password: string, username: string): Promise<User> {
    const emailTaken = await this.userRepository.findOne({ email }, { filters: false });

    if (emailTaken) {
      throw new EmailConflictException();
    }

    const usernameTaken = await this.userRepository.findOne({ username }, { filters: false });

    if (usernameTaken) {
      throw new UsernameConflictException();
    }

    const user = new User({
      email,
      password,
      username
    });

    await this.userRepository.persistAndFlush(user);

    await this.brokerService.emitAsync(UserEvent.CREATED, {
      created: user
    });

    return user;
  }

  async createEmailConfirmation(
    filter: FilterQuery<User>,
    options: {
      newEmail: string;
    }
  ): Promise<void> {
    const user = await this.userRepository.findOne(filter);

    if (!user) {
      throw new UserNotFoundException();
    }

    const emailTaken = await this.userRepository.findOne(
      { email: options.newEmail },
      { filters: false }
    );

    if (emailTaken) {
      throw new EmailConflictException();
    }

    const confirmation = new EmailConfirmation({
      newEmail: options.newEmail,
      oldEmail: user.email,
      user
    });

    await this.emailConfirmationRepository.persistAndFlush(confirmation);
  }

  async createPasswordReset(filter: FilterQuery<User>): Promise<void> {
    const user = await this.userRepository.findOne(filter);

    if (!user) {
      throw new UserNotFoundException();
    }

    const reset = new PasswordReset({
      user
    });

    await this.passwordResetRepository.persistAndFlush(reset);
  }

  async deleteOne(
    filter: FilterQuery<User>,
    options: {
      password: string;
    }
  ): Promise<User> {
    const user = await this.userRepository.findOne(filter);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!(await argon2.verify(user.password, options.password))) {
      throw new IncorrectOldPassword();
    }

    user.deletedAt = new Date();
    user.password = "";

    await this.emailConfirmationRepository.nativeDelete({
      user
    });

    await this.passwordResetRepository.nativeDelete({
      user
    });

    await this.userRepository.persistAndFlush(user);

    await this.brokerService.emitAsync(UserEvent.DELETED, {
      deleted: user
    });

    return user;
  }

  async findOne(filter: FilterQuery<User>): Promise<User | null> {
    return this.userRepository.findOne(filter);
  }

  async findOneOrFail(filter: FilterQuery<User>): Promise<User> {
    const user = await this.userRepository.findOne(filter);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async resetPassword(
    token: string,
    options: {
      newPassword: string;
    }
  ): Promise<void> {
    const reset = await this.passwordResetRepository.findOne({
      token
    });

    if (!reset) {
      throw new InvalidPasswordResetTokenException();
    }

    reset.user.password = options.newPassword;

    await this.emailConfirmationRepository.nativeDelete({
      user: reset.user
    });

    await this.passwordResetRepository.nativeDelete({
      user: reset.user
    });

    await this.userRepository.persistAndFlush(reset.user);

    await this.brokerService.emitAsync(UserEvent.PASSWORD_CHANGED, {
      newPassword: options.newPassword,
      user: reset.user
    });
  }

  async validateCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      username
    });

    if (!user || !(await argon2.verify(user.password, password))) {
      return null;
    }

    return user;
  }
}
