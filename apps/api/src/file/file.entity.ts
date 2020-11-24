import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import { Exclude } from "class-transformer";
import { IsDate } from "class-validator";

import { FileModel } from "@quicksend/models";

import { FolderEntity } from "../folder/folder.entity";
import { ItemEntity } from "../item/item.entity";
import { UserEntity } from "../user/user.entity";

@Entity({ name: FileEntity.TABLE_NAME })
export class FileEntity implements FileModel {
  static readonly TABLE_NAME = "file";

  @CreateDateColumn()
  @IsDate()
  createdAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  @IsDate()
  deletedAt!: Date;

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => ItemEntity, (item) => item.files, {
    eager: true
  })
  item!: ItemEntity;

  @Column()
  name!: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    eager: true,
    onDelete: "CASCADE"
  })
  parent!: FolderEntity;

  @ManyToOne(() => UserEntity, (user) => user.files, {
    eager: true
  })
  user!: UserEntity;
}
