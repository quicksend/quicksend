import { IsNotEmpty, IsString } from "class-validator";

export class UploadFileDto {
  @IsNotEmpty()
  @IsString()
  destination!: string;
}
