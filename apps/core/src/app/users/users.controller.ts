import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { Transactional } from "../common/decorators/transactional.decorator";

import { UsersService } from "./users.service";

import { User } from "./entities/user.entity";

import { ChangePasswordPayload } from "./payloads/change-password.payload";
import { ConfirmEmailPayload } from "./payloads/confirm-email.payload";
import { CreateEmailConfirmationPayload } from "./payloads/create-email-confirmation.payload";
import { CreatePasswordResetPayload } from "./payloads/create-password-reset.payload";
import { CreateUserPayload } from "./payloads/create-user.payload";
import { DeleteUserPayload } from "./payloads/delete-user.payload";
import { FindUserPayload } from "./payloads/find-user.payload";
import { ResetPasswordPayload } from "./payloads/reset-password.payload";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern("auth.email-confirmation.create")
  @Transactional()
  createEmailConfirmation(@Payload() payload: CreateEmailConfirmationPayload): Promise<void> {
    return this.usersService.createEmailConfirmation(payload.user, {
      newEmail: payload.newEmail
    });
  }

  @MessagePattern("auth.password-reset.create")
  @Transactional()
  createPasswordReset(@Payload() payload: CreatePasswordResetPayload): Promise<void> {
    return this.usersService.createPasswordReset(payload.user);
  }

  @MessagePattern("auth.user.change-password")
  @Transactional()
  changePassword(@Payload() payload: ChangePasswordPayload): Promise<void> {
    return this.usersService.changePassword(payload.user, {
      newPassword: payload.newPassword,
      oldPassword: payload.oldPassword
    });
  }

  @MessagePattern("auth.user.confirm-email")
  @Transactional()
  confirmEmail(@Payload() payload: ConfirmEmailPayload): Promise<void> {
    return this.usersService.confirmEmail(payload.token);
  }

  @MessagePattern("auth.user.create")
  @Transactional()
  create(@Payload() payload: CreateUserPayload): Promise<User> {
    return this.usersService.create(payload.email, payload.password, payload.username);
  }

  @MessagePattern("auth.user.delete")
  @Transactional()
  deleteOne(@Payload() payload: DeleteUserPayload): Promise<User> {
    return this.usersService.deleteOne(payload.user, {
      password: payload.password
    });
  }

  @MessagePattern("auth.user.find")
  findOneOrFail(@Payload() payload: FindUserPayload): Promise<User> {
    return this.usersService.findOneOrFail({
      email: payload.email,
      id: payload.id,
      username: payload.username
    });
  }

  @MessagePattern("auth.user.reset-password")
  @Transactional()
  resetPassword(@Payload() payload: ResetPasswordPayload): Promise<void> {
    return this.usersService.resetPassword(payload.token, {
      newPassword: payload.newPassword
    });
  }

  @MessagePattern("auth.user.validate-credentials")
  validateCredentials(@Payload() payload: any): Promise<User | null> {
    return this.usersService.validateCredentials(payload.username, payload.password);
  }
}
