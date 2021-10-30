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

export class ShareItemDto {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  expiresAt?: Date;

  @IsNotEmpty()
  @IsString()
  invitee!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  message?: string;

  @IsBoolean()
  @IsOptional()
  notifyInvitee?: boolean;

  @IsEnum(InvitationRole)
  role!: InvitationRole;
}
