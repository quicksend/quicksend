import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";

import { RecaptchaGuard } from "../common/guards/recaptcha.guard";

import { TransactionalInterceptor } from "../common/interceptors/transactional.interceptor";

import { Request } from "../common/interfaces/request.interface";

import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";

import { User } from "../user/entities/user.entity";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

import { AuthExceptionFilter } from "./auth.filter";
import { UserExceptionFilter } from "../user/user.filter";

@Controller("auth")
@UseFilters(AuthExceptionFilter, UserExceptionFilter)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post("forgot-password")
  @UseGuards(RecaptchaGuard())
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.userService.createPasswordReset(dto.email);
  }

  @Post("login")
  @UseGuards(RecaptchaGuard())
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<User> {
    const user = await this.authService.login(dto.username, dto.password);

    req.session.user = user.id;

    return user;
  }

  @Delete("logout")
  logout(@Req() req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  @Post("register")
  @UseGuards(RecaptchaGuard())
  @UseInterceptors(TransactionalInterceptor)
  register(@Body() dto: RegisterDto): Promise<User> {
    return this.userService.create({
      email: dto.email,
      password: dto.password,
      username: dto.username
    });
  }
}
