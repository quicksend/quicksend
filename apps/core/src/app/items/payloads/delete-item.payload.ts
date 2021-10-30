import { IsNotEmpty, IsString } from "class-validator";

export class DeleteItemPayload {
  @IsNotEmpty()
  @IsString()
  deletedBy!: string;

  @IsNotEmpty()
  @IsString()
  item!: string;
}
