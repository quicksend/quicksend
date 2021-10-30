import { Embedded, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import { generateRandomString } from "@quicksend/common";

import { Snapshot } from "../embeddables/snapshot.embeddable";

import { Item } from "./item.entity";

@Entity()
export class Version {
  @Property()
  createdAt: Date;

  @Property()
  createdBy: string;

  @Property({
    nullable: true
  })
  expiresAt?: Date;

  @ManyToOne(() => Item)
  item: Item;

  @PrimaryKey()
  id: string;

  @Property({
    nullable: true
  })
  name?: string;

  @Embedded(() => Snapshot, {
    object: true
  })
  snapshot: Readonly<Snapshot>;

  constructor(version: {
    createdAt?: Date;
    createdBy?: string;
    expiresAt?: Date;
    item: Item;
    name?: string;
    snapshot: Snapshot;
  }) {
    this.createdAt = version.createdAt || new Date();
    this.createdBy = version.createdBy || version.item.createdBy;
    this.expiresAt = version.expiresAt;
    this.item = version.item;
    this.id = generateRandomString();
    this.name = version.name;
    this.snapshot = version.snapshot;
  }

  static from(
    item: Item,
    options?: {
      createdAt?: Date;
      createdBy?: string;
      expiresAt?: Date;
      name?: string;
    }
  ): Version {
    return new Version({
      createdAt: options?.createdAt,
      createdBy: options?.createdBy,
      expiresAt: options?.expiresAt,
      item,
      name: options?.name,
      snapshot: Snapshot.from(item)
    });
  }
}
