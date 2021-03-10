import { Column, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "../common/entities/base.entity";

import { FolderEntity } from "../folders/folder.entity";
import { ItemEntity } from "../items/item.entity";
import { UserEntity } from "../user/user.entity";

@Entity("file")
export class FileEntity extends BaseEntity {
  @ManyToOne(() => ItemEntity, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE"
  })
  item!: ItemEntity;

  @Column()
  name!: string;

  @ManyToOne(() => FolderEntity, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE"
  })
  parent!: FolderEntity;

  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: false
  })
  user!: UserEntity;
}
