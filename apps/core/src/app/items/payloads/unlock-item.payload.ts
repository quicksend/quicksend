import { IsNotEmpty, IsString } from "class-validator";

export class UnlockItemPayload {
  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  unlockedBy!: string;
}
