import {
  BeforeCreate,
  Embedded,
  Entity,
  EntityRepositoryType,
  Filter,
  IdentifiedReference,
  ManyToOne,
  Property,
  Reference,
  Unique
} from "@mikro-orm/core";

import { Exclude, Transform } from "class-transformer";
import { MaxLength, validateOrReject } from "class-validator";

import { LTreeNode, LTreeRepository } from "../../common/repositories/ltree.repository";

import { Capabilities } from "../embeddables/capabilities.embeddable";
import { Folder } from "../embeddables/folder.embeddable";
import { Lock } from "../embeddables/lock.embeddable";
import { Trash } from "../embeddables/trash.embeddable";

import { File } from "../../storage/entities/file.entity";

@Entity({
  customRepository: () => LTreeRepository
})
@Filter<Item>({
  cond: {
    deletedAt: null
  },
  default: true,
  name: "not_deleted"
})
@Unique<Item>({
  properties: ["name", "parent"]
})
export class Item extends LTreeNode {
  [EntityRepositoryType]?: LTreeRepository<Item>;

  @Embedded(() => Capabilities, {
    object: true
  })
  capabilities: Readonly<Capabilities>;

  @Property()
  createdAt: Date;

  @Property()
  createdBy: string;

  @Exclude()
  @Property({
    nullable: true
  })
  deletedAt?: Date;

  @Property({
    nullable: true
  })
  expiresAt?: Date;

  @ManyToOne(() => File, {
    eager: true,
    nullable: true
  })
  file?: File;

  @Embedded(() => Folder, {
    nullable: true
  })
  folder?: Folder;

  @Embedded(() => Lock, {
    nullable: true
  })
  lock?: Lock;

  @MaxLength(512)
  @Property()
  name: string;

  @Property()
  owner: string;

  @ManyToOne(() => Item, {
    nullable: true,
    wrappedReference: true
  })
  @Transform(({ value }) => value?.id)
  parent?: IdentifiedReference<Item>;

  @Exclude()
  @Unique()
  path!: string;

  @Embedded(() => Trash, {
    nullable: true
  })
  trash?: Trash;

  constructor(item: {
    capabilities?: Partial<Capabilities>;
    createdAt?: Date;
    createdBy: string;
    expiresAt?: Date;
    file?: File;
    folder?: Folder;
    lock?: Lock;
    name: string;
    owner: string;
    parent?: Item;
    trash?: Trash;
  }) {
    super();
    this.capabilities = new Capabilities(item.capabilities);
    this.createdAt = item.createdAt || new Date();
    this.createdBy = item.createdBy;
    this.expiresAt = item.expiresAt;
    this.file = item.file;
    this.folder = item.folder;
    this.lock = item.lock;
    this.name = item.name;
    this.owner = item.owner;
    this.trash = item.trash;

    this.setParent(item.parent);
  }

  setParent(parent?: Item): void {
    this.parent = parent && Reference.create(parent);
    this.setParentPath(...(parent ? [parent.path] : []));
  }

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
