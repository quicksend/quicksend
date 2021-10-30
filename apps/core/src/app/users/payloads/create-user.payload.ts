import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from "class-validator";

export class CreateUserPayload {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  @MaxLength(32)
  @MinLength(2)
  username!: string;
}
