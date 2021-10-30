import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

import { FindUserPayload } from "./find-user.payload";

export class CreatePasswordResetPayload {
  @Type(() => FindUserPayload)
  @ValidateNested()
  user!: FindUserPayload;
}
