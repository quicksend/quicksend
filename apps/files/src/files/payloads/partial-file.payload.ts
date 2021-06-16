import { File } from "@quicksend/types";

import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class PartialFilePayload implements Partial<File> {
  @IsNumber()
  @IsOptional()
  capabilities?: number;

  @IsNumber()
  @IsOptional()
  createdAt?: number;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  hash?: string;

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

  @IsNumber()
  @IsOptional()
  size?: number;
}
