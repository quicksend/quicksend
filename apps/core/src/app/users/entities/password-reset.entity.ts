import { Entity, Filter, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import { User } from "./user.entity";

import { generateRandomString } from "@quicksend/common";

@Entity()
@Filter<PasswordReset>({
  cond: {
    expiresAt: null
  },
  default: true,
  name: "not_expired"
})
export class PasswordReset {
  @Property()
  expiresAt: Date;

  @PrimaryKey()
  token: string;

  @ManyToOne(() => User, {
    eager: true
  })
  user: User;

  // prettier-ignore
  constructor(reset: {
    expiresAt?: Date;
    user: User;
  }) {
    this.expiresAt = reset.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24);
    this.token = generateRandomString(36);
    this.user = reset.user;
  }
}
