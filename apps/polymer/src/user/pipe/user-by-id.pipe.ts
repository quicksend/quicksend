import { Injectable, PipeTransform } from "@nestjs/common";

import { UserService } from "../user.service";

import { User } from "../entities/user.entity";

import { UserNotFoundException } from "../user.exceptions";

@Injectable()
export class UserByIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(id: string): Promise<User> {
    const user = await this.userService.findOne({ id });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
}
