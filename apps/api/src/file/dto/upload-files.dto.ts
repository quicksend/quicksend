import { IsOptional, IsString } from "class-validator";

export class UploadFilesDto {
  @IsOptional()
  @IsString()
  parent?: string;
}
