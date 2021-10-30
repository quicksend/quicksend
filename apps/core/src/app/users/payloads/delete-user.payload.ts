import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { FindUserPayload } from "./find-user.payload";

export class DeleteUserPayload {
  @IsNotEmpty()
  @IsString()
  password!: string;

  @Type(() => FindUserPayload)
  @ValidateNested()
  user!: FindUserPayload;
}
