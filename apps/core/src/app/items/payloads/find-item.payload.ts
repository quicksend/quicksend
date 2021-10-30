import { IsNotEmpty, IsString } from "class-validator";

export class FindItemPayload {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  user!: string;
}
