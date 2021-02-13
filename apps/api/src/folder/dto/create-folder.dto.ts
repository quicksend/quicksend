import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  parent?: string;
}
