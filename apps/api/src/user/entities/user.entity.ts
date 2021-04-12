import argon2 from "argon2";

import { BeforeCreate, Entity, Property, Unique } from "@mikro-orm/core";

import { Exclude } from "class-transformer";
import { IsAlphanumeric, IsEmail } from "class-validator";

import { BaseEntity } from "../../common/entities/base.entity";

@Entity()
export class User extends BaseEntity {
  @Exclude()
  @Property({ nullable: true })
  activatedAt?: Date;

  @Exclude()
  @IsEmail()
  @Property()
  @Unique()
  email!: string;

  @Exclude()
  @Property()
  password!: string;

  @IsAlphanumeric()
  @Property({ length: 32 })
  @Unique()
  username!: string;

  @Property({ persist: false })
  get activated(): boolean {
    return !!this.activatedAt;
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }

    return argon2.verify(this.password, plainTextPassword);
  }

  @BeforeCreate()
  async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);
  }
}
