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
  email!: string;

  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  recaptcha!: string;

  @IsAlphanumeric()
  @MaxLength(32)
  @MinLength(2)
  username!: string;
}
