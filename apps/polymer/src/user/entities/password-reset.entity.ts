import { Entity, ManyToOne, Property, Unique } from "@mikro-orm/core";

import { BaseEntity } from "../../common/entities/base.entity";

import { User } from "./user.entity";

import { generateRandomString } from "../../common/utils/generate-random-string.util";

@Entity()
export class PasswordReset extends BaseEntity {
  @Property()
  expiresAt: Date = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  @Property()
  @Unique()
  token: string = generateRandomString(36);

  @ManyToOne(() => User, {
    eager: true
  })
  user!: User;
}
