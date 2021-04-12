import { User } from "../../user/entities/user.entity";
import { VirtualFile } from "../entities/virtual-file.entity";

import { VirtualFileInvitationPrivileges } from "../enums/virtual-file-invitation-privilege.enum";

export interface CheckFilePrivilegesPayload {
  file: VirtualFile;
  privileges: VirtualFileInvitationPrivileges[];
  user?: User;
}
