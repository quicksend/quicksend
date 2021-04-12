import { ArrayUnique, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

import { ApplicationScopes } from "../enums/application-scopes.enum";

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ArrayUnique()
  @IsEnum(ApplicationScopes, { each: true })
  @IsOptional()
  @Transform(({ value: scopes }) => [
    ...new Set([
      ApplicationScopes.BROWSE_FOLDERS,
      ApplicationScopes.READ_PROFILE,
      ApplicationScopes.VIEW_FILES,
      ...scopes
    ])
  ])
  scopes!: ApplicationScopes[];
}
