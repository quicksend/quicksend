import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { EntityRepository } from "@mikro-orm/postgresql";

import { JsonWebTokenError } from "jsonwebtoken";

import { Config } from "../common/config/config.schema";

import { EntityManagerService } from "../entity-manager/entity-manager.service";
import { UsersService } from "../users/users.service";

import { Token } from "./entities/token.entity";

import { TokenType } from "./enum/token-type.enum";

import { JwtCredentials } from "./interfaces/jwt-credentials.interface";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

import {
  InvalidAccessTokenException,
  InvalidRefreshTokenException,
  InvalidUserCredentialsException
} from "./auth.exceptions";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly entityManagerService: EntityManagerService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  private get tokenRepository(): EntityRepository<Token> {
    return this.entityManagerService.getRepository(Token);
  }

  async blacklistAccessToken(accessToken: string): Promise<void> {
    await this.tokenRepository.nativeDelete({
      type: TokenType.ACCESS_TOKEN,
      value: accessToken
    });
  }

  async blacklistRefreshToken(refreshToken: string): Promise<void> {
    await this.tokenRepository.nativeDelete({
      type: TokenType.REFRESH_TOKEN,
      value: refreshToken
    });
  }

  async createAccessToken<T extends Record<string, unknown>>(payload: T): Promise<string> {
    const secret = this.configService.get("jwt").access_token_secret;

    const value = await this.jwtService.signAsync(payload, {
      expiresIn: FIFTEEN_MINUTES,
      secret
    });

    const token = new Token({
      expiresAt: new Date(Date.now() + FIFTEEN_MINUTES),
      type: TokenType.ACCESS_TOKEN,
      value
    });

    await this.tokenRepository.persistAndFlush(token);

    return value;
  }

  async createRefreshToken<T extends Record<string, unknown>>(payload: T): Promise<string> {
    const secret = this.configService.get("jwt").refresh_token_secret;

    const value = await this.jwtService.signAsync(payload, {
      expiresIn: SEVEN_DAYS,
      secret
    });

    const token = new Token({
      expiresAt: new Date(Date.now() + SEVEN_DAYS),
      type: TokenType.REFRESH_TOKEN,
      value
    });

    await this.tokenRepository.persistAndFlush(token);

    return value;
  }

  async exchangePassword(username: string, password: string): Promise<JwtCredentials> {
    const user = await this.usersService.validateCredentials(username, password);

    if (!user) {
      throw new InvalidUserCredentialsException();
    }

    const accessToken = await this.createAccessToken({
      user: user.id
    });

    const refreshToken = await this.createRefreshToken({
      user: user.id
    });

    return {
      accessToken,
      refreshToken
    };
  }

  async exchangeRefreshToken(refreshToken: string): Promise<JwtCredentials> {
    const payload = await this.validateRefreshToken<JwtPayload>(refreshToken);

    const user = await this.usersService.findOne({
      id: payload.user
    });

    if (!user) {
      throw new InvalidRefreshTokenException();
    }

    const accessToken = await this.createAccessToken({
      user: user.id
    });

    return {
      accessToken,
      refreshToken
    };
  }

  async validateAccessToken<T extends Record<string, unknown> = JwtPayload>(
    accessToken: string
  ): Promise<T> {
    const token = await this.tokenRepository.findOne({
      type: TokenType.ACCESS_TOKEN,
      value: accessToken
    });

    if (!token) {
      throw new InvalidAccessTokenException();
    }

    const secret = this.configService.get("jwt").access_token_secret;

    try {
      const payload = await this.jwtService.verifyAsync<T>(accessToken, {
        secret
      });

      return payload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new InvalidAccessTokenException();
      }

      throw error;
    }
  }

  async validateRefreshToken<T extends Record<string, unknown> = JwtPayload>(
    refreshToken: string
  ): Promise<T> {
    const token = await this.tokenRepository.findOne({
      type: TokenType.REFRESH_TOKEN,
      value: refreshToken
    });

    if (!token) {
      throw new InvalidRefreshTokenException();
    }

    const secret = this.configService.get("jwt").refresh_token_secret;

    try {
      const payload = await this.jwtService.verifyAsync<T>(refreshToken, {
        secret
      });

      return payload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new InvalidRefreshTokenException();
      }

      throw error;
    }
  }
}
