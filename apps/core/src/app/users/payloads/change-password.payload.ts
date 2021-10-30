import { IsNotEmpty, IsString, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { FindUserPayload } from "./find-user.payload";

export class ChangePasswordPayload {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  oldPassword!: string;

  @Type(() => FindUserPayload)
  @ValidateNested()
  user!: FindUserPayload;
}
