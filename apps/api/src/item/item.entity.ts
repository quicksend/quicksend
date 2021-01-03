import { Column, Entity, OneToMany } from "typeorm";

import { Exclude } from "class-transformer";

import { BaseEntity } from "../common/entities/base.entity";

import { FileEntity } from "../file/file.entity";

@Entity({ name: ItemEntity.TABLE_NAME })
export class ItemEntity extends BaseEntity {
  static readonly TABLE_NAME = "item";

  @Column({ unique: true })
  @Exclude()
  discriminator!: string;

  @OneToMany(() => FileEntity, (file) => file.item)
  files!: FileEntity;

  @Column({ unique: true })
  hash!: string;

  @Column()
  size!: number;
}
