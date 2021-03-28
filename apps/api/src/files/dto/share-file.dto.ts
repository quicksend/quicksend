import { IsEnum, IsNotEmpty, IsString } from "class-validator";

import { FileInvitationPrivilegeEnum } from "../enums/file-invitation-privilege.enum";

export class ShareFileDto {
  @IsNotEmpty()
  @IsString()
  invitee!: string;

  @IsEnum(FileInvitationPrivilegeEnum)
  privilege!: FileInvitationPrivilegeEnum;
}
