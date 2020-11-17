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

import { FolderEntity } from "../../folder/entities/folder.entity";
import { ItemEntity } from "./item.entity";
import { UserEntity } from "../../user/entities/user.entity";

@Entity({ name: "files" })
export class FileEntity implements FileModel {
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

  @ManyToOne(() => FolderEntity, (parent) => parent.files, {
    eager: true,
    onDelete: "CASCADE"
  })
  parent!: FolderEntity;

  @ManyToOne(() => UserEntity, (user) => user.files, {
    eager: true
  })
  user!: UserEntity;
}
