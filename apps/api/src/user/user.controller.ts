import {
  Body,
  Controller,
  Get,
  Param,
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

import { DeleteUserDto } from "./dto/delete-user.dto";

@Controller("user")
@UseFilters(UserExceptionFilter)
export class UserController {
  constructor(
    private readonly uowService: UnitOfWorkService,
    private readonly userService: UserService
  ) {}

  @Post("activate/:token")
  activate(@Param("token") token: string): Promise<UserEntity> {
    return this.userService.activate(token);
  }

  @Get("@me")
  @UseApplicationScopes(ApplicationScopesEnum.READ_USER_PROFILE)
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: UserEntity): UserEntity {
    return user;
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
