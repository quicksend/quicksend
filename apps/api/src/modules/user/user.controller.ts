import {
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";

import { AuthGuard } from "../../common/guards/auth.guard";

import { UserEntity } from "./user.entity";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";
import { UserService } from "./user.service";

import { UserExceptionFilter } from "./user.filter";

import { DeleteUserDto } from "./dto/delete-user.dto";

@Controller("user")
@UseFilters(UserExceptionFilter)
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly uowService: UnitOfWorkService,
    private readonly userService: UserService
  ) {}

  @Get("@me")
  me(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }

  @Post("@me/delete")
  async delete(
    @Body() dto: DeleteUserDto,
    @CurrentUser() user: UserEntity
  ): Promise<void> {
    return this.uowService.withTransaction(() =>
      this.userService.deleteOne(user, dto.password)
    );
  }
}
