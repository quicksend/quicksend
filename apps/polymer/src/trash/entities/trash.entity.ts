import { Entity, ManyToOne, OneToOne } from "@mikro-orm/core";

import { BaseEntity } from "../../common/entities/base.entity";

import { File } from "../../files/entities/file.entity";
import { User } from "../../user/entities/user.entity";

@Entity({
  comment: "Holds the original parent of a file before it was moved to the trash bin"
})
export class Trash extends BaseEntity {
  @OneToOne({
    comment: "The file that is marked as trash",
    eager: true
  })
  file!: File;

  @ManyToOne(() => File, {
    comment: "The parent of the file before it was moved to the trash bin",
    eager: true,
    nullable: true
  })
  originalParent?: File;

  @ManyToOne(() => User, {
    comment: "The user that created the trash",
    eager: true
  })
  owner!: User;
}
