import argon2 from "argon2";

import { BeforeCreate, Entity, Property, Unique } from "@mikro-orm/core";

import { Exclude } from "class-transformer";
import { IsAlphanumeric, IsEmail, MaxLength } from "class-validator";

import { BaseEntity } from "../../common/entities/base.entity";

@Entity()
export class User extends BaseEntity {
  @Exclude()
  @IsEmail()
  @Property({ nullable: true })
  @Unique()
  email?: string;

  @Exclude()
  @Property()
  password!: string;

  @IsAlphanumeric()
  @MaxLength(32)
  @Property({ length: 32 })
  @Unique()
  username!: string;

  @BeforeCreate()
  async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);

    return super.validate();
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }

    return argon2.verify(this.password, plainTextPassword);
  }
}
