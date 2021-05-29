import { BigIntType, Entity, Property, Unique } from "@mikro-orm/core";

import { Exclude, Transform } from "class-transformer";
import { Max, Min } from "class-validator";

import { BaseEntity } from "../../common/entities/base.entity";

@Entity({
  comment: "Represents a file that is physically on the disk."
})
export class PhysicalFile extends BaseEntity {
  @Exclude()
  @Property({ comment: "The filename of the physical file" })
  @Unique()
  filename!: string;

  @Property({ comment: "The checksum of the physical file" })
  @Unique()
  hash!: string;

  /*
   * Postgres integers has a maximum of 2147483647 (~2 gb).
   * Using bigint raises this limit to (2 ** 63) - 1, however we set a max to
   * (2 ** 53) - 1 as it is the highest integer javscript can represent accurately
   */
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  @Property({
    comment: "The file size in bytes",
    type: BigIntType
  })
  @Transform(({ value }) => Number(value))
  size!: number;
}
