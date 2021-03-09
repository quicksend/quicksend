import { IsNotEmpty, IsString } from "class-validator";

export class CopyFileDto {
  @IsNotEmpty()
  @IsString()
  destination!: string;
}
