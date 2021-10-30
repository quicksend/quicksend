import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

import { Transform } from "class-transformer";

export class CreateFolderPayload {
  @IsNotEmpty()
  @IsString()
  createdBy!: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  expiresAt?: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNotEmpty()
  @IsString()
  parent!: string;
}
