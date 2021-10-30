import { IsNotEmpty, IsString } from "class-validator";

export class TransferItemPayload {
  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  newOwner!: string;

  @IsNotEmpty()
  @IsString()
  transferredBy!: string;
}
