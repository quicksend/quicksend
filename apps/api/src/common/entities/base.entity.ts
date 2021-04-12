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
  id!: string;

  @Exclude()
  @Property({ version: true })
  version!: number;

  @Property({ persist: false })
  get deleted(): boolean {
    return !!this.deletedAt;
  }

  @BeforeCreate()
  async beforeCreate(): Promise<void> {
    this.id = await generateRandomString();
  }

  @BeforeCreate()
  @BeforeUpdate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
