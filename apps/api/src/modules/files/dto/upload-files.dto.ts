import { IsNotEmpty, IsString } from "class-validator";

export class UploadFilesDto {
  @IsNotEmpty()
  @IsString()
  parent!: string;
}
