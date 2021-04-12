import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { ShareFileDto } from "./share-file.dto";

export class UploadFileDto {
  @IsNotEmpty()
  @IsString()
  destination!: string;

  @IsOptional()
  @Type(() => ShareFileDto)
  @ValidateNested()
  sharing?: ShareFileDto;
}
