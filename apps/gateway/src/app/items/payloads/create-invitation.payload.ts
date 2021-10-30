import { InvitationRole } from "../enums/invitation-role.enum";

export interface CreateInvitationPayload {
  expiresAt?: Date;
  invitee: string;
  inviter: string;
  item: string;
  message?: string;
  notifyInvitee?: boolean;
  role: InvitationRole;
}
