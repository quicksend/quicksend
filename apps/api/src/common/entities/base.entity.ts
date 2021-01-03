import {
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn
} from "typeorm";

import { Exclude } from "class-transformer";

import { ValidateIf, validateOrReject } from "class-validator";

export abstract class BaseEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  @ValidateIf((_object, value) => value !== null)
  deletedAt!: Date | null;

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @BeforeInsert()
  beforeInsert() {
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
