import { Entity, EntityRepositoryType, Index, ManyToOne, Property, Unique } from "@mikro-orm/core";

import { Exclude } from "class-transformer";
import { Min } from "class-validator";

import { BaseEntity } from "../../common/entities/base.entity";

import { LTreeEntity, LTreeRepository } from "../../common/repositories/ltree.repository";

import { Privileges } from "../enums/privileges.enum";

import { File } from "../../files/entities/file.entity";
import { User } from "../../user/entities/user.entity";

@Entity({
  comment: "Represents an invitation to a file created by a user",
  customRepository: () => LTreeRepository
})
@Unique<Invitation>({
  properties: ["invitee", "path"]
})
export class Invitation extends BaseEntity implements LTreeEntity {
  [EntityRepositoryType]?: LTreeRepository<Invitation>;

  @Property({
    comment: "When the invitation will be expired and deleted",
    nullable: true
  })
  expiresAt?: Date;

  @ManyToOne(() => File, {
    comment: "The file that is being shared",
    eager: true
  })
  file!: File;

  @ManyToOne(() => User, {
    comment: "The user that is being invited",
    eager: true,
    nullable: true
  })
  invitee?: User;

  @ManyToOne(() => User, {
    comment: "The user that is inviting the invitee",
    eager: true
  })
  inviter!: User;

  // https://www.postgresql.org/docs/current/ltree.html
  @Exclude()
  @Index({ type: "gist" })
  @Property({
    columnType: "ltree",
    comment: "The virtual path of the shared file"
  })
  path!: string;

  @Min(0)
  @Property({
    comment: "Bitfield representing the privileges of the invitee",
    default: 0,
    unsigned: true
  })
  privileges!: number;

  hasPrivileges(...privileges: Privileges[]): boolean {
    return privileges.every((privilege) => privilege & this.privileges);
  }

  setPrivileges(...privileges: Privileges[]): void {
    this.privileges = privileges.reduce((a, b) => a | b);
  }
}
