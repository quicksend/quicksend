import { BeforeCreate, Entity, ManyToOne, Property, Unique } from "@mikro-orm/core";
import { IsEmail } from "class-validator";

import { BaseEntity } from "../../common/entities/base.entity";

import { User } from "./user.entity";

import { generateRandomString } from "../../common/utils/generate-random-string.util";

@Entity()
export class EmailConfirmation extends BaseEntity {
  @Property()
  expiresAt: Date = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  @IsEmail()
  @Property()
  newEmail!: string;

  @IsEmail()
  @Property()
  oldEmail!: string;

  @Property()
  @Unique()
  token!: string;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: "CASCADE"
  })
  user!: User;

  @Property({ persist: false })
  get expired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }

  @Property({ persist: false })
  get valid(): boolean {
    return !this.expired && this.user.activated && !this.user.deleted;
  }

  @BeforeCreate()
  async beforeCreate(): Promise<void> {
    this.token = await generateRandomString(36);

    return super.beforeCreate();
  }
}
