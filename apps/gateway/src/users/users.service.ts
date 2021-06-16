import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import {
  ChangeUserEmailPattern,
  ChangeUserEmailPayload,
  ChangeUserPasswordPattern,
  ChangeUserPasswordPayload,
  ConfirmUserEmailPattern,
  ConfirmUserEmailPayload,
  CreateUserPattern,
  CreateUserPayload,
  DeleteUserPattern,
  DeleteUserPayload,
  FindUserPattern,
  FindUserPayload,
  ResetUserPasswordPattern,
  ResetUserPasswordPayload,
  User
} from "@quicksend/types";

import { NatsClient } from "@quicksend/nestjs-nats";

import { Config } from "../config/config.interface";

@Injectable()
export class UsersService {
  private readonly client: NatsClient;

  constructor(configService: ConfigService<Config>) {
    this.client = new NatsClient({
      connection: {
        servers: [configService.get("NATS_URL") as string]
      }
    });
  }

  changeEmail(payload: ChangeUserEmailPayload): Promise<void> {
    return this.client.sendAsync<ChangeUserEmailPattern, ChangeUserEmailPayload, void>(
      "users.user.change-email",
      payload
    );
  }

  changePassword(payload: ChangeUserPasswordPayload): Promise<User> {
    return this.client.sendAsync<ChangeUserPasswordPattern, ChangeUserPasswordPayload, User>(
      "users.user.change-password",
      payload
    );
  }

  confirmEmail(payload: ConfirmUserEmailPayload): Promise<void> {
    return this.client.sendAsync<ConfirmUserEmailPattern, ConfirmUserEmailPayload, void>(
      "users.user.confirm-email",
      payload
    );
  }

  create(payload: CreateUserPayload): Promise<User> {
    return this.client.sendAsync<CreateUserPattern, CreateUserPayload, User>(
      "users.user.create",
      payload
    );
  }

  deleteOne(payload: DeleteUserPayload): Promise<User> {
    return this.client.sendAsync<DeleteUserPattern, DeleteUserPayload, User>(
      "users.user.delete",
      payload
    );
  }

  findOne(payload: FindUserPayload): Promise<User> {
    return this.client.sendAsync<FindUserPattern, FindUserPayload, User>(
      "users.user.find",
      payload
    );
  }

  resetPassword(payload: ResetUserPasswordPayload): Promise<void> {
    return this.client.sendAsync<ResetUserPasswordPattern, ResetUserPasswordPayload, void>(
      "users.user.reset-password",
      payload
    );
  }
}
