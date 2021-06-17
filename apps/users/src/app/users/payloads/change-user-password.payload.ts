import { ChangeUserPasswordPayload as IChangeUserPasswordPayload } from "@quicksend/types";

import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangeUserPasswordPayload implements IChangeUserPasswordPayload {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  user!: string;
}
