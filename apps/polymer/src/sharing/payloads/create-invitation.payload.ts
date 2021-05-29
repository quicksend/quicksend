import { Privileges } from "../enums/privileges.enum";

import { File } from "../../files/entities/file.entity";
import { User } from "../../user/entities/user.entity";

export interface CreateInvitationPayload {
  expiresAt?: Date;
  file: File;
  invitee?: User;
  inviter: User;
  message?: string;
  notifyInvitee?: boolean;
  privileges: Array<keyof typeof Privileges>;
}
