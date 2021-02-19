import { IsNotEmpty, IsString } from "class-validator";

export class CopyFileDto {
  @IsNotEmpty()
  @IsString()
  to!: string;
}
