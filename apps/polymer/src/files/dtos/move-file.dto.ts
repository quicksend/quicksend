import { IsNotEmpty, IsString } from "class-validator";

export class MoveFileDto {
  @IsNotEmpty()
  @IsString()
  parent!: string;
}
