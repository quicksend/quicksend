import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CopyItemDto {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  parent!: string;
}
