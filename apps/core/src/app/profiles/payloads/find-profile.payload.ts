import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FindProfilePayload {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  user?: string;
}
