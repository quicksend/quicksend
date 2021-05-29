import { IsNotEmpty, IsString } from "class-validator";

export class RenameFileDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}
