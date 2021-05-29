import { Body, Controller, Get, Param, Patch, Post, UseFilters, UseGuards } from "@nestjs/common";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Transactional } from "../common/decorators/transactional.decorator";
import { ValidateBody } from "../common/decorators/validate-body.decorator";

import { PasswordGuard } from "../common/guards/password.guard";

import { ApplicationScopes } from "../applications/enums/application-scopes.enum";

import { UserExceptionFilter } from "./user.filter";
import { UserService } from "./user.service";

import { User } from "./entities/user.entity";

import { ChangeEmailDto } from "./dtos/change-email.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";

@Controller("user")
@UseFilters(UserExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch("confirm-email/:token")
  @Transactional()
  confirmEmail(@Param("token") token: string): Promise<void> {
    return this.userService.confirmEmail(token);
  }

  @Patch("reset-password/:token")
  @Transactional()
  @ValidateBody(ChangePasswordDto)
  resetPassword(@Param("token") token: string, @Body("password") password: string): Promise<void> {
    return this.userService.resetPassword(token, password);
  }

  @Patch("revert-email-change/:token")
  @Transactional()
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
  @Transactional()
  @UseGuards(PasswordGuard)
  @ValidateBody(ChangeEmailDto)
  changeEmail(@CurrentUser() user: User, @Body("email") email: string): Promise<void> {
    return this.userService.createEmailConfirmation(user, email);
  }

  @Auth()
  @Patch("@me/change-password")
  @Transactional()
  @UseGuards(PasswordGuard)
  @ValidateBody(ChangePasswordDto)
  changePassword(@CurrentUser() user: User, @Body("password") password: string): Promise<User> {
    return this.userService.changePassword(user, password);
  }

  @Auth()
  @Post("@me/delete")
  @Transactional()
  @UseGuards(PasswordGuard)
  deleteOne(@CurrentUser() user: User): Promise<User> {
    return this.userService.deleteOne(user);
  }
}
