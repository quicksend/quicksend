import { IsEmail, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { FindUserPayload } from "./find-user.payload";

export class CreateEmailConfirmationPayload {
  @IsEmail()
  newEmail!: string;

  @Type(() => FindUserPayload)
  @ValidateNested()
  user!: FindUserPayload;
}
