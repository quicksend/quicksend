import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  @IsString()
  recaptcha!: string;

  @IsNotEmpty()
  @MaxLength(32)
  username!: string;
}
