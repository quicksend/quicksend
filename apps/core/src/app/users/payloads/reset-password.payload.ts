import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordPayload {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  token!: string;
}
