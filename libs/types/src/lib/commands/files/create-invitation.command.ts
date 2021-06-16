import { InvitationPrivileges } from "../../enums/invitation-privileges.enum";

import { CommandPattern } from "../../patterns/command.pattern";

export interface CreateInvitationPayload {
  expiresAt?: number;
  invitee?: string;
  inviter: string;
  path: string;
  privileges: Array<keyof typeof InvitationPrivileges>;
}

export type CreateInvitationPattern = CommandPattern<"files", "invitation", "create">;
