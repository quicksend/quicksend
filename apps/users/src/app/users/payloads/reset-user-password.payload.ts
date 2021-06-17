import { ResetUserPasswordPayload as IResetUserPasswordPayload } from "@quicksend/types";

import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetUserPasswordPayload implements IResetUserPasswordPayload {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  token!: string;
}
