import { IsNotEmpty, IsString } from "class-validator";

export class TransferItemDto {
  @IsNotEmpty()
  @IsString()
  newOwner!: string;
}
