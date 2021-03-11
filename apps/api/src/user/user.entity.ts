import * as argon2 from "argon2";

import { Column, Entity } from "typeorm";

import { Exclude } from "class-transformer";
import { IsAlphanumeric, IsEmail, ValidateIf } from "class-validator";

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
    default: false
  })
  admin!: boolean;

  @Column({
    nullable: true,
    type: "varchar",
    unique: true
  })
  @Exclude()
  @IsEmail()
  @ValidateIf((_object, value) => value !== null)
  email!: string | null; // null if user is deleted

  @Column({
    nullable: true,
    type: "varchar"
  })
  @Exclude()
  password!: string | null; // null if user is deleted

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
