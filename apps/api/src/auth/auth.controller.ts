import { Body, Controller, Delete, Post, Req } from "@nestjs/common";

import { Request } from "../common/interfaces/request.interface";

import { AuthService } from "./auth.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { UserEntity } from "../user/user.entity";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly uowService: UnitOfWorkService
  ) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<UserEntity> {
    const user = await this.authService.login(dto);

    req.session.uid = user.id;

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
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request
  ): Promise<UserEntity> {
    const user = await this.uowService.withTransaction(() =>
      this.authService.register(dto)
    );

    req.session.uid = user.id;

    return user;
  }
}
