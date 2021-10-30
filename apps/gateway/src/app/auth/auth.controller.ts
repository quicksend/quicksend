import { ApiTags } from "@nestjs/swagger";

import { Body, Controller, Post } from "@nestjs/common";

import { Observable } from "rxjs";

import { AuthService } from "./auth.service";

import { LoginDto } from "./dtos/login.dto";
import { LogoutDto } from "./dtos/logout.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { RegisterDto } from "./dtos/register.dto";

import { JwtCredentials } from "./resources/jwt-credentials.resource";

@ApiTags("Authentication")
@Controller({
  path: "auth",
  version: "1"
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Returns an access token and refresh token.
   */
  @Post("login")
  login(@Body() dto: LoginDto): Observable<JwtCredentials> {
    return this.authService.login(dto.username, dto.password);
  }

  @Post("logout")
  logout(@Body() dto: LogoutDto): Observable<void> {
    return this.authService.logout(dto.refreshToken);
  }

  @Post("refresh-token")
  refreshToken(@Body() dto: RefreshTokenDto): Observable<JwtCredentials> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post("register")
  register(@Body() dto: RegisterDto): Observable<void> {
    return this.authService.register(dto);
  }
}
