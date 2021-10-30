import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FindVersionPayload {
  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  user!: string;

  @IsNotEmpty()
  @IsString()
  version!: string;
}
