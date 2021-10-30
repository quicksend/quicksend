import { InvitationRole } from "../enums/invitation-role.enum";

export class Invitation {
  createdAt!: Date;

  createdBy!: string;

  expiresAt?: Date;

  id!: string;

  invitee!: string;

  message?: string;

  notifyInvitee!: boolean;

  role!: InvitationRole;
}
