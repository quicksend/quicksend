import { UpdateApplicationPayload as IUpdateApplicationPayload } from "@quicksend/types";

import { OmitType } from "@nestjs/mapped-types";

import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

import { CreateApplicationPayload } from "./create-application.payload";
import { FindApplicationPayload } from "./find-application.payload";

export class UpdateApplicationPayload
  extends FindApplicationPayload
  implements IUpdateApplicationPayload {
  @Type(() => OmitType(CreateApplicationPayload, ["owner"]))
  @ValidateNested()
  data!: Omit<CreateApplicationPayload, "owner">;
}
