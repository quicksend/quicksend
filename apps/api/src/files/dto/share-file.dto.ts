import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinDate
} from "class-validator";

import { Type } from "class-transformer";

import { FileInvitationPrivilegeEnum } from "../enums/file-invitation-privilege.enum";

export class ShareFileDto {
  @IsDate()
  @IsOptional()
  @MinDate(new Date())
  @Type(() => Date)
  expiresAt?: Date;

  @IsNotEmpty()
  @IsString()
  invitee!: string;

  @IsEnum(FileInvitationPrivilegeEnum)
  privilege!: FileInvitationPrivilegeEnum;
}
