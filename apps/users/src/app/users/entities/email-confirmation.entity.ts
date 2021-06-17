import { BeforeCreate, BigIntType, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import { IsEmail, validateOrReject } from "class-validator";

import { User } from "./user.entity";

import { generateRandomString } from "@quicksend/common";

@Entity()
export class EmailConfirmation {
  @Property({ type: BigIntType })
  expiresAt: number = Date.now() + 2 * 24 * 60 * 60 * 1000;

  @IsEmail()
  @Property()
  newEmail!: string;

  @IsEmail()
  @Property({ nullable: true })
  oldEmail?: string;

  @PrimaryKey()
  token: string = generateRandomString(36);

  @ManyToOne(() => User, {
    eager: true
  })
  user!: User;

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
