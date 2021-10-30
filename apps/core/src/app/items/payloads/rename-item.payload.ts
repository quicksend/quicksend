import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RenameItemPayload {
  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  newName!: string;

  @IsNotEmpty()
  @IsString()
  renamedBy!: string;
}
