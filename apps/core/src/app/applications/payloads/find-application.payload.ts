import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FindApplicationPayload {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  secret?: string;
}
