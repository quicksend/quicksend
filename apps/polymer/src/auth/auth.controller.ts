import { Body, Controller, Delete, Post, Req, UseFilters } from "@nestjs/common";

import { Request } from "express";

import { Recaptcha } from "../common/decorators/recaptcha.decorator";
import { Transactional } from "../common/decorators/transactional.decorator";
import { ValidateBody } from "../common/decorators/validate-body.decorator";

import { AuthExceptionFilter } from "./auth.filter";
import { UserExceptionFilter } from "../user/user.filter";

import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";

import { User } from "../user/entities/user.entity";

import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { LoginDto } from "./dtos/login.dto";
import { RegisterDto } from "./dtos/register.dto";

@Controller("auth")
@UseFilters(AuthExceptionFilter, UserExceptionFilter)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post("forgot-password")
  @Recaptcha()
  @ValidateBody(ForgotPasswordDto)
  forgotPassword(@Body("email") email: string): Promise<void> {
    return this.userService.createPasswordReset(email);
  }

  @Post("login")
  @Recaptcha()
  @ValidateBody(LoginDto)
  async login(
    @Body("username") username: string,
    @Body("password") password: string,
    @Req() req: Request
  ): Promise<User> {
    const user = await this.authService.login(username, password);

    req.session.user = user.id;

    return user;
  }

  @Delete("logout")
  logout(@Req() req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((error: Maybe<Error>) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  @Post("register")
  @Recaptcha()
  @Transactional()
  @ValidateBody(RegisterDto)
  register(
    @Body("email") email: string,
    @Body("password") password: string,
    @Body("username") username: string
  ): Promise<User> {
    return this.userService.create(email, password, username);
  }
}
