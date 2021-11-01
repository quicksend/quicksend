import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ListItemVersionsPayload {
  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  user!: string;
}
