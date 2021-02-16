import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";

import { AuthGuard } from "../common/guards/auth.guard";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";
import { UserService } from "./user.service";

import { UserEntity } from "./user.entity";

import { DeleteUserDto } from "./dto/delete-user.dto";

import { PasswordIsIncorrectException } from "./user.exceptions";

@Controller("user")
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
    if (!(await user.comparePassword(dto.password))) {
      throw new PasswordIsIncorrectException();
    }

    return this.uowService.withTransaction(() =>
      this.userService.deleteOne(user)
    );
  }
}
