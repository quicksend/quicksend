import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  discriminator!: string;

  @IsNotEmpty()
  @IsString()
  hash!: string;

  @IsNumber()
  @IsPositive()
  size!: number;
}
