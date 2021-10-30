import { BeforeCreate, Entity, Filter, PrimaryKey, Property, Unique } from "@mikro-orm/core";

import { Exclude } from "class-transformer";

import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  validateOrReject
} from "class-validator";

import { generateRandomString } from "@quicksend/common";

@Entity()
@Filter<User>({
  cond: {
    deletedAt: null
  },
  default: true,
  name: "not_deleted"
})
export class User {
  @Property()
  createdAt: Date;

  @Exclude()
  @Property({
    nullable: true
  })
  deletedAt?: Date;

  @IsEmail()
  @Property({
    nullable: true
  })
  @Unique()
  email?: string;

  @PrimaryKey()
  id: string;

  @Exclude()
  @Property({
    hidden: true
  })
  password: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/)
  @MaxLength(32)
  @MinLength(2)
  @Property()
  @Unique()
  username: string;

  // prettier-ignore
  constructor(user: {
    createdAt?: Date;
    email?: string;
    password: string;
    username: string;
  }) {
    this.createdAt = user.createdAt || new Date();
    this.email = user.email;
    this.id = generateRandomString();
    this.password = user.password;
    this.username = user.username;
  }

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
