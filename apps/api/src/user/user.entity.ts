import * as argon2 from "argon2";

import { Column, Entity, OneToMany } from "typeorm";

import { Exclude } from "class-transformer";
import { IsAlphanumeric, IsEmail, ValidateIf } from "class-validator";

import { BaseEntity } from "../common/entities/base.entity";

import { FileEntity } from "../file/file.entity";
import { FolderEntity } from "../folder/folder.entity";

@Entity({ name: UserEntity.TABLE_NAME })
export class UserEntity extends BaseEntity {
  static readonly TABLE_NAME = "user";

  @Column({ default: false })
  @Exclude()
  activated!: boolean;

  @Column({ default: false })
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

  @OneToMany(() => FileEntity, (file) => file.user)
  files!: FileEntity[];

  @OneToMany(() => FolderEntity, (folder) => folder.user)
  folders!: FolderEntity[];

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

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (!this.password) return false;

    return argon2.verify(this.password, plainTextPassword);
  }
}
