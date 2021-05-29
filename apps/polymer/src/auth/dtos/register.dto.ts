import { IsAlphanumeric, IsEmail, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsAlphanumeric()
  @MaxLength(32)
  @MinLength(2)
  username!: string;
}
