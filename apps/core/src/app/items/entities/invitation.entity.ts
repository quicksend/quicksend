import {
  BeforeCreate,
  Entity,
  EntityRepositoryType,
  Enum,
  Property,
  Unique
} from "@mikro-orm/core";

import { validateOrReject } from "class-validator";

import { LTreeNode, LTreeRepository } from "../../common/repositories/ltree.repository";

import { InvitationRole } from "../enums/invitation-role.enum";

@Entity({
  customRepository: () => LTreeRepository
})
@Unique<Invitation>({
  properties: ["invitee", "path"]
})
export class Invitation extends LTreeNode {
  [EntityRepositoryType]?: LTreeRepository<Invitation>;

  @Property()
  createdAt: Date;

  @Property()
  createdBy: string;

  @Property({
    nullable: true
  })
  expiresAt?: Date;

  @Property()
  invitee: string;

  @Property({
    length: 512,
    nullable: true
  })
  message?: string;

  @Property()
  notifyInvitee: boolean;

  @Enum(() => InvitationRole)
  role: InvitationRole;

  constructor(invitation: {
    createdAt?: Date;
    createdBy: string;
    expiresAt?: Date;
    invitee: string;
    message?: string;
    notifyInvitee?: boolean;
    path?: string;
    role: InvitationRole;
  }) {
    super();
    this.createdAt = invitation.createdAt || new Date();
    this.createdBy = invitation.createdBy;
    this.expiresAt = invitation.expiresAt;
    this.invitee = invitation.invitee;
    this.message = invitation.message;
    this.notifyInvitee = invitation.notifyInvitee || true;
    this.role = invitation.role;

    if (invitation.path) {
      this.setPath(invitation.path);
    }
  }

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
