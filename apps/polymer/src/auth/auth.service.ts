import { Injectable } from "@nestjs/common";

import { UserService } from "../user/user.service";

import { User } from "../user/entities/user.entity";

import { InvalidLoginCredentialsException } from "./auth.exceptions";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  /**
   * Returns the user entity if the password is correct
   */
  async login(username: string, password: string): Promise<User> {
    const user = await this.userService.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      throw new InvalidLoginCredentialsException();
    }

    return user;
  }
}
