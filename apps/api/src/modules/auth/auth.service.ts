import { Injectable } from "@nestjs/common";

import { UserService } from "../user/user.service";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

import {
  InvalidCredentialsException,
  UserNotActivatedException
} from "./auth.exceptions";

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
      throw new UserNotActivatedException();
    }

    return user;
  }

  async register(dto: RegisterDto) {
    return this.userService.create(dto);
  }
}
