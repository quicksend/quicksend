import { Invitation } from "../../entities/files.entities";

import { CommandPattern } from "../../patterns/command.pattern";

export interface FindInvitationPayload {
  invitation: Omit<Partial<Invitation>, "file"> & {
    file?: string;
  };
}

export type FindInvitationPattern = CommandPattern<"files", "invitation", "find">;
