import { IsNotEmpty, IsString } from "class-validator";

export class MoveFolderDto {
  @IsNotEmpty()
  @IsString()
  to!: string;
}