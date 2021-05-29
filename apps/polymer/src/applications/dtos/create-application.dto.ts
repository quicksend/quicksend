import { ArrayUnique, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

import { ApplicationScopes } from "../enums/application-scopes.enum";

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ArrayUnique()
  @IsEnum(ApplicationScopes, { each: true })
  scopes!: ApplicationScopes[];
}
