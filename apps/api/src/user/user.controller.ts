import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

import { AuthGuard } from "../common/guards/auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";

import { DeleteUserDto } from "./dto/delete-user.dto";

import { PasswordIsIncorrectException } from "./user.exceptions";

@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

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

    return this.userService.deleteOne(user);
  }
}
