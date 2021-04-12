import { Injectable } from "@nestjs/common";

import { UserService } from "../user/user.service";

import { User } from "../user/entities/user.entity";

import { InvalidLoginCredentialsException, UserNotActivatedException } from "./auth.exceptions";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  /**
   * Returns the user entity if it is activated and the passwords match
   */
  async login(username: string, password: string): Promise<User> {
    const user = await this.userService.findOne({
      deletedAt: null,
      username
    });

    if (!user) {
      throw new InvalidLoginCredentialsException();
    }

    if (!user.activated) {
      throw new UserNotActivatedException();
    }

    if (!(await user.comparePassword(password))) {
      throw new InvalidLoginCredentialsException();
    }

    return user;
  }
}
