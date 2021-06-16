import { InvitationPrivileges } from "../../enums/invitation-privileges.enum";

import { CommandPattern } from "../../patterns/command.pattern";

import { FindInvitationPayload } from "./find-invitation.command";

export interface UpdateInvitationPayload extends FindInvitationPayload {
  data: {
    expiresAt?: number;
    privileges?: Array<keyof typeof InvitationPrivileges>;
  };
}

export type UpdateInvitationPattern = CommandPattern<"files", "invitation", "update">;
