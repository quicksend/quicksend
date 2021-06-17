import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";

import { User } from "@quicksend/types";

import { UsersService } from "./users.service";

import { CreateUserDto } from "./dtos/create-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  @Delete("@me")
  deleteMe(): Promise<User> {
    return this.usersService.deleteOne({
      user: {}
    });
  }

  @Get("@me")
  findMe(): Promise<User> {
    return this.usersService.findOne({
      user: {}
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<User> {
    return this.usersService.findOne({ user: { id } });
  }
}
