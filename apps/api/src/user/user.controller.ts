import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseInterceptors
} from "@nestjs/common";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

import { TransactionalInterceptor } from "../common/interceptors/transactional.interceptor";

import { UserService } from "./user.service";

import { User } from "./entities/user.entity";

import { ApplicationScopes } from "../applications/enums/application-scopes.enum";

import { ChangeEmailDto } from "./dto/change-email.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

import { UserExceptionFilter } from "./user.filter";

@Controller("user")
@UseFilters(UserExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch("activate/:token")
  @UseInterceptors(TransactionalInterceptor)
  activate(@Param("token") token: string): Promise<User> {
    return this.userService.activate(token);
  }

  @Patch("confirm-email/:token")
  @UseInterceptors(TransactionalInterceptor)
  confirmEmail(@Param("token") token: string): Promise<void> {
    return this.userService.confirmEmail(token);
  }

  @Patch("reset-password/:token")
  @UseInterceptors(TransactionalInterceptor)
  resetPassword(@Body() dto: ResetPasswordDto, @Param("token") token: string): Promise<void> {
    return this.userService.resetPassword(token, dto.newPassword);
  }

  @Patch("revert-email-change/:token")
  @UseInterceptors(TransactionalInterceptor)
  revertEmailChange(@Param("token") token: string): Promise<void> {
    return this.userService.revertEmailChange(token);
  }

  @Auth({ scopes: [ApplicationScopes.READ_PROFILE] })
  @Get("@me")
  me(@CurrentUser() user: User): User {
    return user;
  }

  @Auth()
  @Post("@me/change-email")
  @UseInterceptors(TransactionalInterceptor)
  changeEmail(@Body() dto: ChangeEmailDto, @CurrentUser() user: User): Promise<void> {
    return this.userService.createEmailConfirmation({
      newEmail: dto.email,
      password: dto.password,
      user
    });
  }

  @Auth()
  @Patch("@me/change-password")
  @UseInterceptors(TransactionalInterceptor)
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: User): Promise<User> {
    return this.userService.changePassword({
      newPassword: dto.newPassword,
      oldPassword: dto.oldPassword,
      user
    });
  }

  @Auth()
  @Post("@me/delete")
  @UseInterceptors(TransactionalInterceptor)
  delete(@Body() dto: DeleteUserDto, @CurrentUser() user: User): Promise<User> {
    return this.userService.deleteOneWithPassword(user, dto.password);
  }
}
