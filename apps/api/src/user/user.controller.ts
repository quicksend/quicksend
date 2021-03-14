import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UseApplicationScopes } from "../common/decorators/use-application-scopes.decorator";

import { AuthGuard } from "../common/guards/auth.guard";

import { ApplicationScopesEnum } from "../applications/enums/application-scopes.enum";

import { UserEntity } from "./user.entity";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";
import { UserService } from "./user.service";

import { UserExceptionFilter } from "./user.filter";

import { ChangeEmailDto } from "./dto/change-email.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller("user")
@UseFilters(UserExceptionFilter)
export class UserController {
  constructor(
    private readonly uowService: UnitOfWorkService,
    private readonly userService: UserService
  ) {}

  @Patch("activate/:token")
  async activate(@Param("token") token: string): Promise<UserEntity> {
    return this.uowService.withTransaction(() =>
      this.userService.activate(token)
    );
  }

  @Patch("confirm-email/:token")
  async confirmEmail(@Param("token") token: string): Promise<void> {
    return this.uowService.withTransaction(() =>
      this.userService.confirmEmail(token)
    );
  }

  @Patch("reset-password/:token")
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Param("token") token: string
  ): Promise<void> {
    return this.uowService.withTransaction(() =>
      this.userService.resetPassword(token, dto.password)
    );
  }

  @Patch("revert-email-change/:token")
  async revertEmailChange(@Param("token") token: string): Promise<void> {
    return this.uowService.withTransaction(() =>
      this.userService.revertEmailChange(token)
    );
  }

  @Get("@me")
  @UseApplicationScopes(ApplicationScopesEnum.READ_USER_PROFILE)
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }

  @Post("@me/change-email")
  @UseGuards(AuthGuard)
  async changeEmail(
    @Body() dto: ChangeEmailDto,
    @CurrentUser() user: UserEntity
  ): Promise<void> {
    return this.uowService.withTransaction(() =>
      this.userService.createEmailConfirmation(user, dto.email, dto.password)
    );
  }

  @Patch("@me/change-password")
  @UseGuards(AuthGuard)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: UserEntity
  ): Promise<UserEntity> {
    return this.uowService.withTransaction(() =>
      this.userService.changePassword(user, dto.oldPassword, dto.newPassword)
    );
  }

  @Post("@me/delete")
  @UseGuards(AuthGuard)
  async delete(
    @Body() dto: DeleteUserDto,
    @CurrentUser() user: UserEntity
  ): Promise<void> {
    return this.uowService.withTransaction(() =>
      this.userService.deleteOne(user, dto.password)
    );
  }
}
