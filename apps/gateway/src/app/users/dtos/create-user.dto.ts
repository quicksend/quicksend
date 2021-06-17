import { CreateUserPayload } from "@quicksend/types";

import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

export class CreateUserDto implements CreateUserPayload {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @MinLength(2)
  username!: string;
}
