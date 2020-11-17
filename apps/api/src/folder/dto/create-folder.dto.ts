import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { CreateFolder } from "@quicksend/interfaces";

export class CreateFolderDto implements CreateFolder {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  parent!: string;
}
