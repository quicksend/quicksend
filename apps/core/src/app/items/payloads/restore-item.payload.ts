import { IsNotEmpty, IsString } from "class-validator";

export class RestoreItemPayload {
  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  restoreTo!: string;

  @IsNotEmpty()
  @IsString()
  restoredBy!: string;
}
