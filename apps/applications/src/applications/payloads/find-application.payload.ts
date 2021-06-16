import { FindApplicationPayload as IFindApplicationPayload } from "@quicksend/types";

import { Type } from "class-transformer";

import { ValidateNested } from "class-validator";

import { PartialApplicationPayload } from "./partial-application.payload";

export class FindApplicationPayload implements IFindApplicationPayload {
  @Type(() => PartialApplicationPayload)
  @ValidateNested()
  application!: PartialApplicationPayload;
}
