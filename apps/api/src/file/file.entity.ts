import { Column, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "../common/entities/base.entity";

import { FolderEntity } from "../folder/folder.entity";
import { ItemEntity } from "../item/item.entity";
import { UserEntity } from "../user/user.entity";

@Entity({ name: "file" })
export class FileEntity extends BaseEntity {
  @ManyToOne(() => ItemEntity, (item) => item.files, {
    eager: true,
    onDelete: "CASCADE"
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
