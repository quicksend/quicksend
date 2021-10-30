import { ApiTags } from "@nestjs/swagger";

import { Controller, Delete, Get, Param } from "@nestjs/common";

import { Observable } from "rxjs";

import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

import { UsersService } from "./users.service";

import { Me } from "./resources/me.resource";
import { User } from "./resources/user.resource";

@ApiTags("Users")
@Auth()
@Controller({
  path: "users",
  version: "1"
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Delete("@me")
  // deleteOne(@CurrentUser() user: string): Observable<void> {
  //   return this.usersService.deleteOne({});
  // }

  @Get("@me")
  findMe(@CurrentUser() user: string): Observable<Me> {
    return this.usersService.findOne({ id: user });
  }

  @Get(":user_id")
  findOne(@Param("user_id") userId: string): Observable<User> {
    return this.usersService.findOne({ id: userId });
  }
}
