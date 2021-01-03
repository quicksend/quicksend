import { IsOptional, IsUUID } from "class-validator";

export class UploadFilesDto {
  @IsOptional()
  @IsUUID(4)
  parent?: string;
}
