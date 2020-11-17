import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

import { CreateUser } from "@quicksend/interfaces";

export class RegisterDto implements CreateUser {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  recaptcha!: string;

  @MaxLength(32)
  @IsAlphanumeric()
  @IsNotEmpty()
  username!: string;
}
