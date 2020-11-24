import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import { Exclude } from "class-transformer";
import { IsDate } from "class-validator";

import { ItemModel } from "@quicksend/models";

import { FileEntity } from "../file/file.entity";

@Entity({ name: ItemEntity.TABLE_NAME })
export class ItemEntity implements ItemModel {
  static readonly TABLE_NAME = "item";

  @CreateDateColumn()
  @IsDate()
  createdAt!: Date;

  @DeleteDateColumn()
  @Exclude()
  @IsDate()
  deletedAt!: Date;

  @Column({ unique: true })
  @Exclude()
  discriminator!: string;

  @OneToMany(() => FileEntity, (file) => file.item)
  files!: FileEntity;

  @Column({ unique: true })
  hash!: string;

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  size!: number;
}