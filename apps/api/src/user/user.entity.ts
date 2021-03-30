import argon2 from "argon2";

import { Column, Entity } from "typeorm";

import { Exclude } from "class-transformer";
import { IsAlphanumeric, IsEmail } from "class-validator";

import { BaseEntity } from "../common/entities/base.entity";

@Entity("user")
export class UserEntity extends BaseEntity {
  @Column({
    nullable: true,
    type: "varchar",
    unique: true
  })
  @Exclude()
  activationToken!: string | null;

  @Column({
    unique: true
  })
  @Exclude()
  @IsEmail()
  email!: string;

  @Column({
    nullable: true,
    type: "varchar"
  })
  @Exclude()
  password!: string; // null if user is deleted

  @Column({
    length: 32,
    unique: true
  })
  @IsAlphanumeric()
  username!: string;

  get activated(): boolean {
    return !this.activationToken;
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }

    return argon2.verify(this.password, plainTextPassword);
  }
}
