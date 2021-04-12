import { BeforeCreate, Entity, ManyToOne, Property, Unique } from "@mikro-orm/core";

import { BaseEntity } from "../../common/entities/base.entity";

import { User } from "./user.entity";

import { generateRandomString } from "../../common/utils/generate-random-string.util";

@Entity()
export class ActivationToken extends BaseEntity {
  @Property()
  @Unique()
  token!: string;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: "CASCADE"
  })
  user!: User;

  @Property({ persist: false })
  get valid(): boolean {
    return !this.user.activated && !this.user.deleted;
  }

  @BeforeCreate()
  async beforeCreate(): Promise<void> {
    this.token = await generateRandomString(36);

    return super.beforeCreate();
  }
}
