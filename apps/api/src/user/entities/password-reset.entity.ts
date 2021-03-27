import { BeforeInsert, Column, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "../../common/entities/base.entity";
import { UserEntity } from "../user.entity";

import { generateRandomString } from "../../common/utils/generate-random-string.util";

@Entity("password-reset")
export class PasswordResetEntity extends BaseEntity {
  @Column()
  expiresAt!: Date;

  @Column({
    unique: true
  })
  token!: string;

  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: false
  })
  user!: UserEntity;

  get expired() {
    return Date.now() >= this.expiresAt.getTime();
  }

  @BeforeInsert()
  async beforeInsert() {
    this.expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    this.token = await generateRandomString(16);

    return super.beforeInsert();
  }
}
