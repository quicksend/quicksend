import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RenameItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;
}
