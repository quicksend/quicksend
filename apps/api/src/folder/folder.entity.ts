import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import { Exclude } from "class-transformer";
import { IsDate } from "class-validator";

import { FolderModel } from "@quicksend/models";

import { UserEntity } from "../user/user.entity";

@Entity({ name: FolderEntity.TABLE_NAME })
export class FolderEntity implements FolderModel {
  static readonly TABLE_NAME = "folder";

  @OneToMany(() => FolderEntity, (entry) => entry.parent)
  children!: FolderEntity[];

  @CreateDateColumn()
  @IsDate()
  createdAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  @IsDate()
  deletedAt!: Date;

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false })
  isRoot!: boolean;

  @Column()
  name!: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    onDelete: "CASCADE"
  })
  parent!: FolderEntity;

  @ManyToOne(() => UserEntity, (user) => user.files, {
    eager: true
  })
  user!: UserEntity;
}
