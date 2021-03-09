import { IsOptional, IsString } from "class-validator";

export class RenameFileDto {
  @IsOptional()
  @IsString()
  name!: string;
}
