import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CopyItemPayload {
  @IsNotEmpty()
  @IsString()
  copiedBy!: string;

  @IsNotEmpty()
  @IsString()
  destination!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  source!: string;
}
