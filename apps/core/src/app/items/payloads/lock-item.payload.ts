import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

import { Transform } from "class-transformer";

export class LockItemPayload {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  expiresAt?: Date;

  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  lockedBy!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
