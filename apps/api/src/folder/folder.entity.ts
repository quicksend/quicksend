import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "../common/entities/base.entity";

import { UserEntity } from "../user/user.entity";

@Entity({ name: FolderEntity.TABLE_NAME })
export class FolderEntity extends BaseEntity {
  static readonly TABLE_NAME = "folder";

  @OneToMany(() => FolderEntity, (entry) => entry.parent)
  children!: FolderEntity[];

  @Column({ default: false })
  isRoot!: boolean;

  @Column()
  name!: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    onDelete: "CASCADE"
  })
  parent!: FolderEntity;

  @ManyToOne(() => UserEntity, (user) => user.files, {
    eager: true
  })
  user!: UserEntity;
}
