import { ConfirmUserEmailPayload as IConfirmUserEmailPayload } from "@quicksend/types";

import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmUserEmailPayload implements IConfirmUserEmailPayload {
  @IsNotEmpty()
  @IsString()
  token!: string;
}
