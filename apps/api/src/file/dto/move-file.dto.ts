import { IsOptional, IsString } from "class-validator";

export class MoveFileDto {
  @IsOptional()
  @IsString()
  to!: string;
}
