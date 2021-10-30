import { OmitType } from "@nestjs/mapped-types";

import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

import { CreateApplicationPayload } from "./create-application.payload";
import { FindApplicationPayload } from "./find-application.payload";

export class UpdateApplicationPayload {
  @Type(() => FindApplicationPayload)
  @ValidateNested()
  application!: FindApplicationPayload;

  @Type(() => OmitType(CreateApplicationPayload, ["createdBy"]))
  @ValidateNested()
  data!: Omit<CreateApplicationPayload, "createdBy">;
}
