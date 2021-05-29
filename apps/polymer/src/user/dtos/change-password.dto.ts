import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;
}
