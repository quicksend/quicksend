import { IsNotEmpty, IsString } from "class-validator";

export class MoveItemDto {
  @IsNotEmpty()
  @IsString()
  parent!: string;
}
