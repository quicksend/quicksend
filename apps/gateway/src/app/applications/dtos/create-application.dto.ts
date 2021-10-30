import { ArrayUnique, IsArray, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

import { Scope } from "../enums/scope.enum";

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  name!: string;

  @ArrayUnique()
  @IsArray()
  @IsEnum(Scope, {
    each: true
  })
  scopes!: Scope[];
}
