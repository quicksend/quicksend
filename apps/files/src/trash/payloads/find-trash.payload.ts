import { FindTrashPayload as IFindTrashPayload } from "@quicksend/types";

import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

class PartialTrashPayload {
  @IsNumber()
  @IsOptional()
  createdAt?: number;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  file?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  originalParent?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  owner?: string;
}

export class FindTrashPayload implements IFindTrashPayload {
  trash!: PartialTrashPayload;
}
