import { BeforeCreate, Entity, Filter, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import { IsEmail, IsOptional, validateOrReject } from "class-validator";

import { User } from "./user.entity";

import { generateRandomString } from "@quicksend/common";

@Entity()
@Filter<EmailConfirmation>({
  cond: {
    expiresAt: null
  },
  default: true,
  name: "not_expired"
})
export class EmailConfirmation {
  @Property()
  expiresAt: Date;

  @IsEmail()
  @Property()
  newEmail: string;

  @IsEmail()
  @IsOptional()
  @Property({
    nullable: true
  })
  oldEmail?: string;

  @PrimaryKey()
  token: string;

  @ManyToOne(() => User, {
    eager: true
  })
  user: User;

  // prettier-ignore
  constructor(confirmation: {
    expiresAt?: Date;
    newEmail: string;
    oldEmail?: string;
    user: User;
  }) {
    this.expiresAt = confirmation.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24);
    this.newEmail = confirmation.newEmail;
    this.oldEmail = confirmation.oldEmail;
    this.token = generateRandomString(36);
    this.user = confirmation.user;
  }

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
