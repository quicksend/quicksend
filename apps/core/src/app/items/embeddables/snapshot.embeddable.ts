import { Embeddable, Embedded, Property } from "@mikro-orm/core";

import { Capabilities } from "./capabilities.embeddable";
import { Folder } from "./folder.embeddable";
import { Lock } from "./lock.embeddable";
import { Trash } from "./trash.embeddable";

import { Item } from "../entities/item.entity";

@Embeddable()
export class Snapshot {
  @Embedded(() => Capabilities, {
    object: true
  })
  capabilities: Capabilities;

  @Property()
  createdAt: Date;

  @Property()
  createdBy: string;

  @Property()
  deletedAt?: Date;

  @Property()
  expiresAt?: Date;

  @Property({
    nullable: true
  })
  file?: string;

  @Embedded(() => Folder, {
    nullable: true,
    object: true
  })
  folder?: Folder;

  @Embedded(() => Lock, {
    nullable: true,
    object: true
  })
  lock?: Lock;

  @Property()
  name: string;

  @Property()
  owner: string;

  @Property({
    nullable: true
  })
  parent?: string;

  @Embedded(() => Trash, {
    nullable: true,
    object: true
  })
  trash?: Trash;

  constructor(snapshot: {
    capabilities: Capabilities;
    createdAt: Date;
    createdBy: string;
    deletedAt?: Date;
    expiresAt?: Date;
    file?: string;
    folder?: Folder;
    lock?: Lock;
    name: string;
    owner: string;
    parent?: string;
    trash?: Trash;
  }) {
    this.capabilities = snapshot.capabilities;
    this.createdAt = snapshot.createdAt;
    this.createdBy = snapshot.createdBy;
    this.deletedAt = snapshot.deletedAt;
    this.expiresAt = snapshot.expiresAt;
    this.file = snapshot.file;
    this.folder = snapshot.folder;
    this.lock = snapshot.lock;
    this.name = snapshot.name;
    this.owner = snapshot.owner;
    this.parent = snapshot.parent;
    this.trash = snapshot.trash;
  }

  static from(item: Item): Snapshot {
    return new Snapshot({
      ...item,
      file: item.file?.id,
      parent: item.parent?.id
    });
  }
}
