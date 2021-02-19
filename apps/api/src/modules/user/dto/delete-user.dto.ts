import { IsNotEmpty, IsString } from "class-validator";

import { DeleteUser } from "@quicksend/interfaces";

export class DeleteUserDto implements DeleteUser {
  @IsNotEmpty()
  @IsString()
  password!: string;
}
