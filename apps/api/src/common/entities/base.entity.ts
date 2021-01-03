import {
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn
} from "typeorm";

import { customAlphabet } from "nanoid/async";

import { Exclude } from "class-transformer";

import { ValidateIf, validateOrReject } from "class-validator";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",
  21
);

export abstract class BaseEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  @ValidateIf((_object, value) => value !== null)
  deletedAt!: Date | null;

  @PrimaryColumn()
  id!: string;

  @BeforeInsert()
  async beforeInsert() {
    this.id = await nanoid();

    return validateOrReject(this, {
      // properties can be undefined if it's optional, so we don't want
      // class validator to throw an error for those optional properties
      skipUndefinedProperties: true
    });
  }

  @BeforeUpdate()
  beforeUpdate() {
    return validateOrReject(this);
  }
}
