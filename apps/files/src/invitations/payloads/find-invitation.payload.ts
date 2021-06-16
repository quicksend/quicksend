import { FindInvitationPayload as IFindInvitationPayload } from "@quicksend/types";

import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

import { Type } from "class-transformer";

class PartialInvitationPayload {
  @IsNumber()
  @IsOptional()
  createdAt?: number;

  @IsNumber()
  @IsOptional()
  expiresAt?: number;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  file?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  invitee?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  inviter?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  message?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  path?: string;

  @IsNumber()
  @IsOptional()
  privileges?: number;
}

export class FindInvitationPayload implements IFindInvitationPayload {
  @Type(() => PartialInvitationPayload)
  @ValidateNested()
  invitation!: PartialInvitationPayload;
}
