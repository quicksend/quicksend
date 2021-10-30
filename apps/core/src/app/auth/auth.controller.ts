import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { Transactional } from "../common/decorators/transactional.decorator";

import { AuthService } from "./auth.service";

import { JwtCredentials } from "./interfaces/jwt-credentials.interface";

import { ExchangePasswordPayload } from "./payloads/exchange-password.payload";
import { ExchangeRefreshTokenPayload } from "./payloads/exchange-refresh-token.payload";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern("auth.blacklist.access-token")
  @Transactional()
  blacklistAccessToken(@Payload() payload: any): Promise<void> {
    return this.authService.blacklistAccessToken(payload.accessToken);
  }

  @MessagePattern("auth.blacklist.refresh-token")
  @Transactional()
  blacklistRefreshToken(@Payload() payload: any): Promise<void> {
    return this.authService.blacklistRefreshToken(payload.refreshToken);
  }

  @MessagePattern("auth.exchange.password")
  @Transactional()
  exchangePassword(@Payload() payload: ExchangePasswordPayload): Promise<JwtCredentials> {
    return this.authService.exchangePassword(payload.username, payload.password);
  }

  @MessagePattern("auth.exchange.refresh-token")
  @Transactional()
  exchangeRefreshToken(@Payload() payload: ExchangeRefreshTokenPayload): Promise<JwtCredentials> {
    return this.authService.exchangeRefreshToken(payload.refreshToken);
  }

  @MessagePattern("auth.validate.access-token")
  validateAccessToken(@Payload() payload: any): Promise<Record<string, unknown>> {
    return this.authService.validateAccessToken(payload.accessToken);
  }

  @MessagePattern("auth.validate.refresh-token")
  validateRefreshToken(@Payload() payload: any): Promise<Record<string, unknown>> {
    return this.authService.validateRefreshToken(payload.accessToken);
  }
}
