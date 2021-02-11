import {
  Column,
  Entity,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent
} from "typeorm";

import { BaseEntity } from "../common/entities/base.entity";

import { UserEntity } from "../user/user.entity";

@Entity({ name: FolderEntity.TABLE_NAME })
@Tree("closure-table")
export class FolderEntity extends BaseEntity {
  static readonly TABLE_NAME = "folder";

  @TreeChildren()
  children!: FolderEntity[];

  @Column()
  name!: string;

  @TreeParent()
  parent!: FolderEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.files, {
    eager: true
  })
  user!: UserEntity;
}
