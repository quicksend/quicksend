import { Column, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "../common/entities/base.entity";

import { FolderEntity } from "../folder/folder.entity";
import { ItemEntity } from "../item/item.entity";
import { UserEntity } from "../user/user.entity";

@Entity({ name: FileEntity.TABLE_NAME })
export class FileEntity extends BaseEntity {
  static readonly TABLE_NAME = "file";

  @ManyToOne(() => ItemEntity, (item) => item.files, {
    eager: true,
    onDelete: "SET NULL"
  })
  item!: ItemEntity | null;

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
