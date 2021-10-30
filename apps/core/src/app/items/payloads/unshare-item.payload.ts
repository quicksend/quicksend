import { IsNotEmpty, IsString } from "class-validator";

export class UnshareItemPayload {
  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  unsharedBy!: string;
}
