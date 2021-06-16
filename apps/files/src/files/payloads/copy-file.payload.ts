import { CopyFilePayload as ICopyFilePayload } from "@quicksend/types";

import { Type } from "class-transformer";

import { ValidateNested } from "class-validator";

import { PartialFilePayload } from "./partial-file.payload";

export class CopyFilePayload implements ICopyFilePayload {
  @Type(() => PartialFilePayload)
  @ValidateNested()
  from!: PartialFilePayload;

  @Type(() => PartialFilePayload)
  @ValidateNested()
  to!: PartialFilePayload;
}
