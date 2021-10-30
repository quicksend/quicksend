import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ConfirmEmailPayload {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  token!: string;
}
