import {
  ApplicationScopes,
  CreateApplicationPayload as ICreateApplicationPayload
} from "@quicksend/types";

import { ArrayUnique, IsArray, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateApplicationPayload implements ICreateApplicationPayload {
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  name!: string;

  @IsNotEmpty()
  @IsString()
  owner!: string;

  @ArrayUnique()
  @IsArray()
  @IsEnum(ApplicationScopes, { each: true })
  scopes!: ApplicationScopes[];
}
