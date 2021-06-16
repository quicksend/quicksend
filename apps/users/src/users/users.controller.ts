import { Controller, UseFilters } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import {
  ChangeUserEmailPattern,
  ChangeUserPasswordPattern,
  ConfirmUserEmailPattern,
  CreateUserPattern,
  DeleteUserPattern,
  FindUserPattern,
  ResetUserPasswordPattern
} from "@quicksend/types";

import { UsersExceptionFilter } from "./users.filter";
import { UsersService } from "./users.service";

import { User } from "./entities/user.entity";

import { ChangeUserEmailPayload } from "./payloads/change-user-email.payload";
import { ChangeUserPasswordPayload } from "./payloads/change-user-password.payload";
import { ConfirmUserEmailPayload } from "./payloads/confirm-user-email.payload";
import { CreateUserPayload } from "./payloads/create-user.payload";
import { DeleteUserPayload } from "./payloads/delete-user.payload";
import { FindUserPayload } from "./payloads/find-user.payload";
import { ResetUserPasswordPayload } from "./payloads/reset-user-password.payload";

@Controller()
@UseFilters(UsersExceptionFilter)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @MessagePattern<ChangeUserEmailPattern>("users.user.change-email")
  changeEmail(@Payload() payload: ChangeUserEmailPayload): Promise<void> {
    return this.userService.createEmailConfirmation(payload.user, payload.newEmail);
  }

  @MessagePattern<ChangeUserPasswordPattern>("users.user.change-password")
  changePassword(@Payload() payload: ChangeUserPasswordPayload): Promise<User> {
    return this.userService.changePassword(payload.user, payload.newPassword);
  }

  @MessagePattern<ConfirmUserEmailPattern>("users.user.confirm-email")
  confirmEmail(@Payload() payload: ConfirmUserEmailPayload): Promise<void> {
    return this.userService.confirmEmail(payload.token);
  }

  @MessagePattern<CreateUserPattern>("users.user.create")
  create(@Payload() payload: CreateUserPayload): Promise<User> {
    return this.userService.create(payload.email, payload.password, payload.username);
  }

  @MessagePattern<DeleteUserPattern>("users.user.delete")
  deleteOne(@Payload() payload: DeleteUserPayload): Promise<User> {
    return this.userService.deleteOne(payload.user);
  }

  @MessagePattern<FindUserPattern>("users.user.find")
  findOne(@Payload() payload: FindUserPayload): Promise<User> {
    return this.userService.findOne(payload.user);
  }

  @MessagePattern<ResetUserPasswordPattern>("users.user.reset-password")
  resetPassword(@Payload() payload: ResetUserPasswordPayload): Promise<void> {
    return this.userService.resetPassword(payload.token, payload.newPassword);
  }
}
