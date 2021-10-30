import { IsNotEmpty, IsString } from "class-validator";

export class MoveItemPayload {
  @IsNotEmpty()
  @IsString()
  destination!: string;

  @IsNotEmpty()
  @IsString()
  movedBy!: string;

  @IsNotEmpty()
  @IsString()
  source!: string;
}
