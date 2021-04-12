import { FilterQuery } from "@mikro-orm/core";

import { User } from "../../user/entities/user.entity";
import { VirtualFile } from "../entities/virtual-file.entity";

import { VirtualFileInvitationPrivileges } from "../enums/virtual-file-invitation-privilege.enum";

export interface ShareFilePayload {
  expiresAt?: Date;
  file: FilterQuery<VirtualFile>;
  invitee?: FilterQuery<User>;
  inviter: User;
  message?: string;
  notifyInvitee?: boolean;
  privileges: VirtualFileInvitationPrivileges[];
}
