import { Body, Controller, Get, Post } from "@nestjs/common";

import { PasswordIsIncorrectException } from "./user.exceptions";
import { UserService } from "./user.service";

import { DeleteUserDto } from "./dto/delete-user.dto";

import { UserEntity } from "./entities/user.entity";

import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("@me")
  me(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }

  @Post("@me/delete")
  deleteOne(
    @Body() dto: DeleteUserDto,
    @CurrentUser() user: UserEntity
  ): Promise<void> {
    if (!user.comparePassword(dto.password)) {
      throw new PasswordIsIncorrectException();
    }

    return this.userService.deleteOne(user);
  }
}
