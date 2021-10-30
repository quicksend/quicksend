import { IsNotEmpty, IsString } from "class-validator";

export class UntrashItemPayload {
  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  untrashedBy!: string;
}
