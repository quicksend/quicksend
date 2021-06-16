import { FindFilePayload as IFindFilePayload } from "@quicksend/types";

import { Type } from "class-transformer";

import { ValidateNested } from "class-validator";

import { PartialFilePayload } from "./partial-file.payload";

export class FindFilePayload implements IFindFilePayload {
  @Type(() => PartialFilePayload)
  @ValidateNested()
  file!: PartialFilePayload;
}
