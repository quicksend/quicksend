import { Injectable } from "@nestjs/common";

import { UserService } from "../user/user.service";

import { UserEntity } from "../user/user.entity";

import {
  InvalidLoginCredentialsException,
  UserNotActivatedException
} from "./auth.exceptions";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(username: string, password: string): Promise<UserEntity> {
    const user = await this.userService.findOneByQuery({
      where: [{ email: username }, { username }]
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new InvalidLoginCredentialsException();
    }

    if (!user.activated) {
      throw new UserNotActivatedException();
    }

    return user;
  }

  async register(
    email: string,
    password: string,
    username: string
  ): Promise<UserEntity> {
    return this.userService.create(email, password, username);
  }
}
