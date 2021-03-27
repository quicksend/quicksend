import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UploadFileDto {
  @IsNotEmpty()
  @IsString()
  destination!: string;

  @IsBoolean()
  isPublic = false;
}
