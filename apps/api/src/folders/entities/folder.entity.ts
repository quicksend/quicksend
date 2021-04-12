import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "../../common/entities/base.entity";

import { User } from "../../user/entities/user.entity";

@Entity()
export class Folder extends BaseEntity {
  @Property()
  name!: string;

  @ManyToOne(() => Folder, {
    eager: true,
    nullable: true,
    onDelete: "CASCADE"
  })
  parent?: Folder;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: "CASCADE"
  })
  user!: User;
}
