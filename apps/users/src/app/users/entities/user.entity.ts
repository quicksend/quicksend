import argon2 from "argon2";

import {
  BeforeCreate,
  BigIntType,
  Entity,
  Filter,
  PrimaryKey,
  Property,
  Unique
} from "@mikro-orm/core";

import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  validateOrReject
} from "class-validator";

import { User as IUser } from "@quicksend/types";

import { generateRandomString } from "@quicksend/common";

@Entity()
@Filter<User>({
  cond: () => ({
    deletedAt: {
      $eq: null
    }
  }),
  default: true,
  name: "notDeleted"
})
export class User implements IUser {
  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @Property({
    nullable: true,
    type: BigIntType
  })
  deletedAt?: number;

  @IsEmail()
  @Property()
  @Unique()
  email!: string;

  @PrimaryKey()
  id: string = generateRandomString();

  @Property()
  password!: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  @MaxLength(32)
  @MinLength(2)
  @Property({ length: 32 })
  @Unique()
  username!: string;

  @Property({ persist: false })
  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  @BeforeCreate()
  async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);

    return validateOrReject(this);
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }

    return argon2.verify(this.password, plainTextPassword);
  }
}
