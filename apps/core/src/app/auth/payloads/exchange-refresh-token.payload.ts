import { IsNotEmpty, IsString } from "class-validator";

export class ExchangeRefreshTokenPayload {
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
