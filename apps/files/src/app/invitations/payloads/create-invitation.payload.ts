import {
  CreateInvitationPayload as ICreateInvitationPayload,
  InvitationPrivileges
} from "@quicksend/types";

import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from "class-validator";

export class CreateInvitationPayload implements ICreateInvitationPayload {
  @IsNumber()
  @IsOptional()
  @Min(Date.now())
  expiresAt?: number;

  @IsNotEmpty()
  @IsString()
  path!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  invitee?: string;

  @IsNotEmpty()
  @IsString()
  inviter!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  message?: string;

  @IsBoolean()
  @IsOptional()
  notifyInvitee?: boolean;

  @ArrayMinSize(1)
  @ArrayUnique()
  @IsArray()
  @IsEnum(InvitationPrivileges, { each: true })
  privileges!: Array<keyof typeof InvitationPrivileges>;
}
