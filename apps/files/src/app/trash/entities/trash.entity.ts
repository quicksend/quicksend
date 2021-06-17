import { BigIntType, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import { Trash as ITrash } from "@quicksend/types";

import { File } from "../../files/entities/file.entity";

import { generateRandomString } from "@quicksend/common";

@Entity()
export class Trash implements ITrash {
  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @ManyToOne(() => File, {
    eager: true
  })
  file!: File;

  @PrimaryKey()
  id: string = generateRandomString();

  @ManyToOne(() => File, {
    eager: true,
    nullable: true
  })
  originalParent?: File;

  @Property()
  owner!: string;
}
