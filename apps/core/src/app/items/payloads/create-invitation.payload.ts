import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength
} from "class-validator";

import { Transform } from "class-transformer";

import { InvitationRole } from "../enums/invitation-role.enum";

export class CreateInvitationPayload {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    if (value < Date.now() + SEVEN_DAYS) {
      return new Date(Date.now() + SEVEN_DAYS);
    }

    return new Date(value);
  })
  expiresAt?: Date;

  @IsNotEmpty()
  @IsString()
  invitee!: string;

  @IsNotEmpty()
  @IsString()
  inviter!: string;

  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  message?: string;

  @IsBoolean()
  @IsOptional()
  notifyInvitee?: boolean;

  @IsEnum(InvitationRole)
  @Transform(({ value }) => (isNaN(value) ? InvitationRole[value] : value)) // Handle reverse mappings for typescript enums
  role!: InvitationRole;
}
