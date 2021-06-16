import {
  BeforeCreate,
  BigIntType,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique
} from "@mikro-orm/core";

import { Exclude } from "class-transformer";
import { Min, validateOrReject } from "class-validator";

import { LTreeEntity, LTreeRepository, generateRandomString } from "@quicksend/common";
import { Invitation as IInvitation, InvitationPrivileges } from "@quicksend/types";

import { File } from "../../files/entities/file.entity";

@Entity({ customRepository: () => LTreeRepository })
@Unique({ properties: ["invitee", "path"] })
export class Invitation implements LTreeEntity, IInvitation {
  [EntityRepositoryType]?: LTreeRepository<Invitation>;

  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @Property({
    nullable: true,
    type: BigIntType
  })
  expiresAt?: number;

  @ManyToOne(() => File, {
    eager: true
  })
  file!: File;

  @PrimaryKey()
  id: string = generateRandomString();

  @Property({ nullable: true })
  invitee?: string;

  @Property()
  inviter!: string;

  // https://www.postgresql.org/docs/current/ltree.html
  @Exclude()
  @Index({ type: "gist" })
  @Property({ columnType: "ltree" })
  path!: string;

  @Min(0)
  @Property({ unsigned: true })
  privileges: number = 0;

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }

  hasPrivileges(...privileges: InvitationPrivileges[]): boolean {
    return privileges.every((privilege) => (this.privileges & privilege) === privilege);
  }

  setPrivileges(...privileges: InvitationPrivileges[]): void {
    this.privileges = privileges.reduce((a, b) => a | b);
  }
}
