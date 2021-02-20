import { Injectable } from "@nestjs/common";

import { UserService } from "../user/user.service";

import { UserEntity } from "../user/user.entity";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

import {
  InvalidLoginCredentialsException,
  UserNotActivatedException
} from "./auth.exceptions";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(dto: LoginDto): Promise<UserEntity> {
    const user = await this.userService.findOneByQuery({
      where: [{ email: dto.username }, { username: dto.username }]
    });

    if (!user || !(await user.comparePassword(dto.password))) {
      throw new InvalidLoginCredentialsException();
    }

    if (!user.activated) {
      throw new UserNotActivatedException();
    }

    return user;
  }

  async register(dto: RegisterDto): Promise<UserEntity> {
    return this.userService.create(dto);
  }
}
