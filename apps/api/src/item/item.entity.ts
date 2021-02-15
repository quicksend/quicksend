import { Column, Entity, OneToMany } from "typeorm";

import { Exclude, Transform } from "class-transformer";
import { Max, Min } from "class-validator";

import { BaseEntity } from "../common/entities/base.entity";

import { FileEntity } from "../file/file.entity";

@Entity({ name: "item" })
export class ItemEntity extends BaseEntity {
  @Column({ unique: true })
  @Exclude()
  discriminator!: string;

  @OneToMany(() => FileEntity, (file) => file.item)
  files!: FileEntity;

  @Column({ unique: true })
  hash!: string;

  /*
   * Postgres integers has a maximum of 2147483647 bytes (~2 gb).
   * Using bigint raises this limit to (2 ** 63) - 1, however we set a max to
   * (2 ** 53) - 1 as it is the highest integer javscript can represent accurately
   */
  @Column({ type: "bigint" })
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  @Transform((value) => Number(value))
  size!: number;
}
