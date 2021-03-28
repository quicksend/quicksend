import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";

import { BaseEntity } from "../../common/entities/base.entity";
import { FileEntity } from "../file.entity";
import { UserEntity } from "../../user/user.entity";

import { FileInvitationPrivilegeEnum } from "../enums/file-invitation-privilege.enum";

@Entity("file_invitation")
export class FileInvitationEntity extends BaseEntity {
  @ManyToOne(() => FileEntity, (file) => file.invitations, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE"
  })
  file!: FileEntity;

  @JoinColumn()
  @OneToOne(() => UserEntity, {
    eager: true,
    nullable: false
  })
  invitee!: UserEntity;

  @Column({
    default: FileInvitationPrivilegeEnum.READ_ONLY,
    enum: FileInvitationPrivilegeEnum,
    nullable: false,
    type: "enum"
  })
  privilege!: FileInvitationPrivilegeEnum;
}
