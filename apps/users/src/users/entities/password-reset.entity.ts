import { BigIntType, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import { User } from "./user.entity";

import { generateRandomString } from "@quicksend/common";

@Entity()
export class PasswordReset {
  @Property({ type: BigIntType })
  expiresAt: number = Date.now() + 2 * 24 * 60 * 60 * 1000;

  @PrimaryKey()
  token: string = generateRandomString(36);

  @ManyToOne(() => User, {
    eager: true
  })
  user!: User;
}
