import { CreateFilePayload as ICreateFilePayload } from "@quicksend/types";

import { IsNotEmpty, IsNumber, IsString, MaxLength, Min, ValidateNested } from "class-validator";

import { Type } from "class-transformer";

import { PartialFilePayload } from "./partial-file.payload";

export class CreateFilePayload implements ICreateFilePayload {
  @IsNotEmpty()
  @IsString()
  hash!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNotEmpty()
  @IsString()
  owner!: string;

  @Type(() => PartialFilePayload)
  @ValidateNested()
  parent!: PartialFilePayload;

  @IsNumber()
  @Min(0)
  size!: number;
}
