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

import { FileEntity } from "../../file/entities/file.entity";
import { UserEntity } from "../../user/entities/user.entity";

@Entity({ name: "folders" })
export class FolderEntity implements FolderModel {
  @OneToMany(() => FolderEntity, (folder) => folder.parent)
  children!: FolderEntity[];

  @CreateDateColumn()
  @IsDate()
  createdAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  @IsDate()
  deletedAt!: Date;

  @OneToMany(() => FileEntity, (file) => file.parent)
  files!: FileEntity[];

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

  @ManyToOne(() => UserEntity, (user) => user.folders)
  user!: UserEntity;
}
