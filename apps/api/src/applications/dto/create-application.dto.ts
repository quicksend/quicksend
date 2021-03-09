import {
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from "class-validator";

import { Transform } from "class-transformer";

import { ApplicationScopesEnum } from "../enums/application-scopes.enum";

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ArrayUnique()
  @IsEnum(ApplicationScopesEnum, { each: true })
  @IsOptional()
  @Transform(({ value: scopes }) => [
    ...new Set([
      ApplicationScopesEnum.READ_FOLDER_METADATA,
      ApplicationScopesEnum.READ_USER_PROFILE,
      ...scopes
    ])
  ])
  scopes!: ApplicationScopesEnum[];
}
