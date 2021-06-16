import { FindUserPayload as IFindUserPayload } from "@quicksend/types";

import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

import { Type } from "class-transformer";

class PartialUserPayload {
  @IsNumber()
  @IsOptional()
  createdAt?: number;

  @IsNumber()
  @IsOptional()
  deletedAt?: number;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  username?: string;
}

export class FindUserPayload implements IFindUserPayload {
  @Type(() => PartialUserPayload)
  @ValidateNested()
  user!: PartialUserPayload;
}
