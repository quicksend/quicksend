import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UseFilters,
  UseGuards
} from "@nestjs/common";

import { RecaptchaGuard } from "../common/guards/recaptcha.guard";
import { Request } from "../common/interfaces/request.interface";

import { AuthService } from "./auth.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";
import { UserService } from "../user/user.service";

import { AuthExceptionFilter } from "./auth.filter";
import { UserExceptionFilter } from "../user/user.filter";

import { UserEntity } from "../user/user.entity";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
@UseFilters(AuthExceptionFilter, UserExceptionFilter)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly uowService: UnitOfWorkService,
    private readonly userService: UserService
  ) {}

  @Post("forgot-password")
  @UseGuards(RecaptchaGuard)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.uowService.withTransaction(() =>
      this.userService.createPasswordReset(dto.email)
    );
  }

  @Post("login")
  @UseGuards(RecaptchaGuard)
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<UserEntity> {
    const user = await this.authService.login(dto.username, dto.password);

    req.session.uid = user.id;

    return user;
  }

  @Delete("logout")
  logout(@Req() req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  @Post("register")
  @UseGuards(RecaptchaGuard)
  async register(@Body() dto: RegisterDto): Promise<UserEntity> {
    return this.uowService.withTransaction(() =>
      this.userService.create(dto.email, dto.password, dto.username)
    );
  }
}
