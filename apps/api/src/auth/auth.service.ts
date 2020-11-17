import { Injectable } from "@nestjs/common";

import {
  InvalidCredentialsException,
  UserNotActivated
} from "./auth.exceptions";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(dto: LoginDto) {
    const user = await this.userService.findOneByQuery({
      where: [{ email: dto.username }, { username: dto.username }]
    });

    if (!user || !user.comparePassword(dto.password)) {
      throw new InvalidCredentialsException();
    }

    if (!user.activated) {
      throw new UserNotActivated();
    }

    return user;
  }

  async register(dto: RegisterDto) {
    return this.userService.create(dto);
  }
}
