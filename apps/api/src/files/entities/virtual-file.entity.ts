import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "../../common/entities/base.entity";

import { Folder } from "../../folders/entities/folder.entity";
import { PhysicalFile } from "./physical-file.entity";
import { User } from "../../user/entities/user.entity";

/**
 * Represents a file in the user's filesystem.
 */
@Entity()
export class VirtualFile extends BaseEntity {
  @ManyToOne(() => PhysicalFile, {
    eager: true,
    onDelete: "CASCADE"
  })
  metadata!: PhysicalFile;

  @Property({ primary: true })
  name!: string;

  @ManyToOne(() => Folder, {
    eager: true,
    onDelete: "CASCADE",
    primary: true
  })
  parent!: Folder;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: "CASCADE"
  })
  user!: User;
}
