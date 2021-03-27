import { IsEnum, IsNotEmpty, IsString } from "class-validator";

import { FilePolicyLevelsEnum } from "../enums/file-policies-levels.enum";

export class ShareFileDto {
  @IsNotEmpty()
  @IsString()
  beneficiary!: string;

  @IsEnum(FilePolicyLevelsEnum)
  level!: FilePolicyLevelsEnum;
}
