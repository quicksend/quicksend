import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FindUserPayload {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  username?: string;
}
