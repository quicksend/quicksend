import { Entity, Enum, ManyToOne, OneToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "../../common/entities/base.entity";

import { User } from "../../user/entities/user.entity";
import { VirtualFile } from "./virtual-file.entity";

import { VirtualFileInvitationPrivileges } from "../enums/virtual-file-invitation-privilege.enum";

/**
 * Represents an invitation to a user's virtual file. The invitee can
 * either be a specific person or if null, makes the file public for anyone
 * with the invitation id.
 */
@Entity()
export class VirtualFileInvitation extends BaseEntity {
  @Property({ nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => VirtualFile, {
    eager: true,
    onDelete: "CASCADE"
  })
  file!: VirtualFile;

  @OneToOne({
    nullable: true,
    onDelete: "CASCADE"
  })
  invitee?: User;

  @OneToOne({
    eager: true,
    onDelete: "CASCADE"
  })
  inviter!: User;

  @Enum({
    array: true,
    items: () => VirtualFileInvitationPrivileges
  })
  privileges!: VirtualFileInvitationPrivileges[];

  @Property({ persist: false })
  get expired(): boolean {
    return !!this.expiresAt && Date.now() >= this.expiresAt.getTime();
  }
}
