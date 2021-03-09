import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  recaptcha!: string;

  @IsNotEmpty()
  @IsString()
  username!: string;
}
