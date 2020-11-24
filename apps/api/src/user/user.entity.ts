import * as argon2 from "argon2";

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import { Exclude } from "class-transformer";
import { IsAlphanumeric, IsDate, IsEmail } from "class-validator";

import { UserModel } from "@quicksend/models";

import { FileEntity } from "../file/file.entity";
import { FolderEntity } from "../folder/folder.entity";

@Entity({ name: UserEntity.TABLE_NAME })
export class UserEntity implements UserModel {
  static readonly TABLE_NAME = "user";

  @Column({ default: false })
  @Exclude()
  activated!: boolean;

  @Column({ default: false })
  admin!: boolean;

  @CreateDateColumn()
  @IsDate()
  createdAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  @IsDate()
  deletedAt!: Date;

  @Column({ unique: true })
  @Exclude()
  @IsEmail()
  email!: string;

  @OneToMany(() => FileEntity, (file) => file.user)
  files!: FileEntity[];

  @OneToMany(() => FolderEntity, (folder) => folder.user)
  folders!: FolderEntity[];

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ length: 32, unique: true })
  @IsAlphanumeric()
  username!: string;

  comparePassword(plainTextPassword: string): Promise<boolean> {
    return argon2.verify(this.password, plainTextPassword);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }
}
