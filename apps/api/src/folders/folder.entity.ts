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

@Entity("folder")
@Tree("closure-table")
export class FolderEntity extends BaseEntity {
  @TreeChildren()
  children!: FolderEntity[];

  @Column()
  name!: string;

  @TreeParent()
  parent!: FolderEntity | null;

  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: false
  })
  user!: UserEntity;
}
