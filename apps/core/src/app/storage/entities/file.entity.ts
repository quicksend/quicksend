import {
  BeforeCreate,
  Embedded,
  Entity,
  Filter,
  PrimaryKey,
  Property,
  Unique
} from "@mikro-orm/core";

import { Exclude } from "class-transformer";
import { Min, validateOrReject } from "class-validator";

import { generateRandomString } from "@quicksend/common";

import { Infection } from "../embeddables/infection.embeddable";

@Entity()
@Filter<File>({
  cond: {
    deletedAt: null
  },
  default: true,
  name: "not_deleted"
})
export class File {
  @Property()
  createdAt: Date;

  @Exclude()
  @Property({
    nullable: true
  })
  deletedAt?: Date;

  @Property()
  @Unique()
  hash: string;

  @PrimaryKey()
  id: string;

  @Embedded(() => Infection, {
    nullable: true
  })
  infection?: Infection;

  @Property()
  mimetype?: string;

  @Min(0)
  @Property()
  size: number;

  constructor(file: {
    createdAt?: Date;
    hash: string;
    id?: string;
    infection?: Infection;
    mimetype?: string;
    size: number;
  }) {
    this.createdAt = file.createdAt || new Date();
    this.hash = file.hash;
    this.id = file.id || generateRandomString();
    this.infection = file.infection;
    this.mimetype = file.mimetype;
    this.size = file.size;
  }

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
