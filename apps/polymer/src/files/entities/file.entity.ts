import {
  Entity,
  EntityRepositoryType,
  IdentifiedReference,
  Index,
  ManyToOne,
  Property,
  Reference,
  Unique
} from "@mikro-orm/core";

import { Exclude, Transform } from "class-transformer";
import { Min } from "class-validator";

import { BaseEntity } from "../../common/entities/base.entity";

import { LTreeEntity, LTreeRepository } from "../../common/repositories/ltree.repository";

import { Capabilities } from "../enums/capabilities.enum";

import { User } from "../../user/entities/user.entity";

@Entity({
  comment: "Represents a virtual file (or directory) owned by a user.",
  customRepository: () => LTreeRepository
})
@Unique<File>({
  properties: ["name", "parent"]
})
@Unique<File>({
  properties: ["owner", "path"]
})
export class File extends BaseEntity implements LTreeEntity {
  [EntityRepositoryType]?: LTreeRepository<File>;

  @Min(0)
  @Property({
    comment: "Bitfield representing the capabalities of the file",
    default: 0,
    unsigned: true
  })
  capabilities!: number;

  @Property({
    comment: "The SHA-256 hash of the file",
    nullable: true
  })
  hash?: string;

  @Property({
    comment: "Whether the file is a file cabinet",
    default: false
  })
  isCabinet: boolean = false;

  @Property({
    comment: "Whether the file is a trash bin",
    default: false
  })
  isTrashBin: boolean = false;

  @Property({ comment: "Name of the file" })
  name!: string;

  @ManyToOne(() => User, {
    comment: "The user that owns the file",
    eager: true
  })
  owner!: User;

  @ManyToOne(() => File, {
    comment: "The parent of the file",
    nullable: true,
    wrappedReference: true
  })
  @Transform(({ value }) => value?.id)
  parent?: IdentifiedReference<File>;

  // https://www.postgresql.org/docs/current/ltree.html
  @Exclude()
  @Index({ type: "gist" })
  @Property({
    columnType: "ltree",
    comment: "The virtual path of the file"
  })
  path!: string;

  @Min(0)
  @Property({
    comment: "Size of the file in bytes",
    default: 0,
    unsigned: true
  })
  size: number = 0;

  constructor(parent?: File) {
    super();
    this.parent = parent && Reference.create(parent);
  }

  hasCapabilities(...capabalities: Capabilities[]): boolean {
    return capabalities.every((capability) => capability & this.capabilities);
  }

  setCapabilities(...capabilities: Capabilities[]): void {
    this.capabilities = capabilities.reduce((a, b) => a | b);
  }
}
