import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import {
  EmailConfirmationCreatedPattern,
  EmailConfirmationCreatedPayload,
  PasswordResetCreatedPattern,
  PasswordResetCreatedPayload,
  UserCreatedPattern,
  UserCreatedPayload,
  UserDeletedPattern,
  UserDeletedPayload,
  UserEmailChangedPattern,
  UserEmailChangedPayload,
  UserPasswordChangedPattern,
  UserPasswordChangedPayload
} from "@quicksend/types";

import { EmailConfirmation } from "./entities/email-confirmation.entity";
import { PasswordReset } from "./entities/password-reset.entity";
import { User } from "./entities/user.entity";

import {
  EmailConflictException,
  InvalidEmailConfirmationTokenException,
  InvalidPasswordResetTokenException,
  UsernameConflictException,
  UserNotFoundException
} from "./users.exceptions";

import { UsersRelay } from "./users.relay";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRelay: UsersRelay,

    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepository: EntityRepository<EmailConfirmation>,

    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: EntityRepository<PasswordReset>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>
  ) {}

  async changePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    await this.usersRelay.publish<UserPasswordChangedPattern, UserPasswordChangedPayload>({
      pattern: "users.user.password-changed",
      payload: (entityManager) => {
        user.password = newPassword;

        entityManager.persist(user);

        return {
          newPassword,
          user
        };
      }
    });

    return user;
  }

  async confirmEmail(token: string): Promise<void> {
    const confirmation = await this.emailConfirmationRepository.findOne({ token });

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

    await this.usersRelay.publish<UserEmailChangedPattern, UserEmailChangedPayload>({
      pattern: "users.user.email-changed",
      payload: (entityManager): UserEmailChangedPayload => {
        confirmation.user.email = confirmation.newEmail;

        entityManager.remove(confirmation);
        entityManager.persist(confirmation.user);

        return {
          newEmail: confirmation.newEmail,
          oldEmail: confirmation.oldEmail || confirmation.user.email,
          user: confirmation.user
        };
      }
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

    const { user } = await this.usersRelay.publish<UserCreatedPattern, UserCreatedPayload>({
      pattern: "users.user.created",
      payload: (entityManager) => {
        const user = new User();

        user.email = email;
        user.password = password;
        user.username = username;

        entityManager.persist(user);

        return { user };
      }
    });

    return this.userRepository.map(user);
  }

  async createEmailConfirmation(id: string, newEmail: string): Promise<void> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    const emailTaken = await this.userRepository.findOne({ email: newEmail }, { filters: false });

    if (emailTaken) {
      throw new EmailConflictException();
    }

    await this.usersRelay.publish<EmailConfirmationCreatedPattern, EmailConfirmationCreatedPayload>(
      {
        pattern: "users.email-confirmation.created",
        payload: (entityManager) => {
          const confirmation = new EmailConfirmation();

          confirmation.newEmail = newEmail;
          confirmation.oldEmail = user.email;
          confirmation.user = user;

          entityManager.persist(confirmation);

          return {
            token: confirmation.token,
            user
          };
        }
      }
    );
  }

  async createPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UserNotFoundException();
    }

    await this.usersRelay.publish<PasswordResetCreatedPattern, PasswordResetCreatedPayload>({
      pattern: "users.password-reset.created",
      payload: (entityManager) => {
        const reset = new PasswordReset();

        reset.user = user;

        entityManager.persist(reset);

        return {
          token: reset.token,
          user: reset.user
        };
      }
    });
  }

  async deleteOne(filter: FilterQuery<User>): Promise<User> {
    const user = await this.userRepository.findOne(filter);

    if (!user) {
      throw new UserNotFoundException();
    }

    await this.usersRelay.publish<UserDeletedPattern, Promise<UserDeletedPayload>>({
      pattern: "users.user.deleted",
      payload: async (entityManager) => {
        await Promise.all([
          entityManager.nativeDelete(EmailConfirmation, { user }),
          entityManager.nativeDelete(PasswordReset, { user })
        ]);

        user.deletedAt = Date.now();

        entityManager.persist(user);

        return { user };
      }
    });

    return user;
  }

  async findOne(filter: FilterQuery<User>): Promise<User> {
    const user = await this.userRepository.findOne(filter);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.passwordResetRepository.findOne({ token });

    if (!reset) {
      throw new InvalidPasswordResetTokenException();
    }

    await this.usersRelay.publish<UserPasswordChangedPattern, Promise<UserPasswordChangedPayload>>({
      pattern: "users.user.password-changed",
      payload: async (entityManager) => {
        await Promise.all([
          entityManager.nativeDelete(EmailConfirmation, { user: reset.user }),
          entityManager.nativeDelete(PasswordReset, { user: reset.user })
        ]);

        reset.user.password = newPassword;

        entityManager.persist(reset.user);

        return {
          newPassword,
          user: reset.user
        };
      }
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async removeExpiredTokens(): Promise<void> {
    await Promise.all([
      this.emailConfirmationRepository.nativeDelete({
        expiresAt: {
          $lte: Date.now()
        }
      }),

      this.passwordResetRepository.nativeDelete({
        expiresAt: {
          $lte: Date.now()
        }
      })
    ]);
  }
}
