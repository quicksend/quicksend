import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FindInvitationPayload {
  @IsNotEmpty()
  @IsString()
  invitation!: string;

  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  user!: string;
}
