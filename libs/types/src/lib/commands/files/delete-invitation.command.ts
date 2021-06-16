import { CommandPattern } from "../../patterns/command.pattern";

import { FindInvitationPayload } from "./find-invitation.command";

export interface DeleteInvitationPayload extends FindInvitationPayload {
  removeDescendants?: boolean;
}

export type DeleteInvitationPattern = CommandPattern<"files", "invitation", "delete">;
