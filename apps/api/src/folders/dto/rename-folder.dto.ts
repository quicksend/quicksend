import { IsNotEmpty, IsString } from "class-validator";

export class RenameFolderDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}
