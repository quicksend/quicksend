import { Application, ApplicationScopes } from "@quicksend/types";

import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";

export class PartialApplicationPayload implements Partial<Application> {
  @IsNumber()
  @IsOptional()
  createdAt?: number;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  owner?: string;

  @ArrayUnique()
  @IsArray()
  @IsEnum(ApplicationScopes, { each: true })
  @IsOptional()
  scopes?: ApplicationScopes[];

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  secret?: string;
}
