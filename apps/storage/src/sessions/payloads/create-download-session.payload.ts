import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateDownloadSessionPayload {
  @IsNumber()
  @IsOptional()
  @Min(Date.now())
  expiresAt?: number;

  @IsNotEmpty()
  @IsString()
  hash!: string;

  @IsNotEmpty()
  @IsString()
  owner!: string;
}
