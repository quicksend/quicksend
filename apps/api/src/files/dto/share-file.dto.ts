import {
  ArrayUnique,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinDate
} from "class-validator";

import { Type } from "class-transformer";

import { VirtualFileInvitationPrivileges } from "../enums/virtual-file-invitation-privilege.enum";

export class ShareFileDto {
  @IsDate()
  @IsOptional()
  @MinDate(new Date())
  @Type(() => Date)
  expiresAt?: Date;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  invitee?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  message?: string;

  @IsBoolean()
  notifyInvitee = true;

  @ArrayUnique()
  @IsEnum(VirtualFileInvitationPrivileges, { each: true })
  privileges!: VirtualFileInvitationPrivileges[];
}
