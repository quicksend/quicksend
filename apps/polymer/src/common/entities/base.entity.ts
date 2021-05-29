import { BeforeCreate, BeforeUpdate, PrimaryKey, Property } from "@mikro-orm/core";
import { Exclude } from "class-transformer";

import { validateOrReject } from "class-validator";

import { generateRandomString } from "../utils/generate-random-string.util";

export abstract class BaseEntity {
  @Property()
  createdAt: Date = new Date();

  @Exclude()
  @Property({ nullable: true })
  deletedAt?: Date;

  @PrimaryKey()
  id: string = generateRandomString();

  @Property({ persist: false })
  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  @BeforeCreate()
  @BeforeUpdate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
