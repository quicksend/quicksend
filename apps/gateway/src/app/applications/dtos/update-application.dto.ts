import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from "class-validator";

import { Scope } from "../enums/scope.enum";

export class UpdateApplicationDto {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @ArrayUnique()
  @IsArray()
  @IsEnum(Scope, {
    each: true
  })
  @IsOptional()
  scopes?: Scope[];
}
