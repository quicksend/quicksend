import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { Transform } from "class-transformer";

export class LockItemDto {
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  expiresAt?: Date;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
