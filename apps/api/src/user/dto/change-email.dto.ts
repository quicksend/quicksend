import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ChangeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
