import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateUploadSessionPayload {
  @IsNumber()
  @IsOptional()
  @Min(Date.now())
  expiresAt?: number;

  @IsNotEmpty()
  @IsString()
  owner!: string;
}
