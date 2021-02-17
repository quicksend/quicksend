import { IsNotEmpty, IsString } from "class-validator";

export class MoveFolderDto {
  @IsNotEmpty()
  @IsString()
  from!: string;

  @IsNotEmpty()
  @IsString()
  to!: string;
}
