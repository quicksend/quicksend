import { CreateFolderPayload as ICreateFolderPayload } from "@quicksend/types";

import { IsNotEmpty, IsString, MaxLength, ValidateNested } from "class-validator";

import { Type } from "class-transformer";

import { PartialFilePayload } from "./partial-file.payload";

export class CreateFolderPayload implements ICreateFolderPayload {
  @Type(() => PartialFilePayload)
  @ValidateNested()
  parent!: PartialFilePayload;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;
}
