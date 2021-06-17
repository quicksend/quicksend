import { ChangeUserEmailPayload as IChangeUserEmailPayload } from "@quicksend/types";

import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ChangeUserEmailPayload implements IChangeUserEmailPayload {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  newEmail!: string;

  @IsNotEmpty()
  @IsString()
  user!: string;
}
