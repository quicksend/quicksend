import { BigIntType, Entity, Property, Unique } from "@mikro-orm/core";

import { Exclude, Transform } from "class-transformer";
import { Max, Min } from "class-validator";

import { BaseEntity } from "../../common/entities/base.entity";

/**
 * Represents a file that is physically on the disk. Users do not own this entity,
 * but instead shared with many users who upload the same file. It is a hard link
 * to the actual file.
 */
@Entity()
export class PhysicalFile extends BaseEntity {
  @Exclude()
  @Property()
  @Unique()
  discriminator!: string;

  @Property()
  @Unique()
  hash!: string;

  /*
   * Postgres integers has a maximum of 2147483647 (~2 gb).
   * Using bigint raises this limit to (2 ** 63) - 1, however we set a max to
   * (2 ** 53) - 1 as it is the highest integer javscript can represent accurately
   */
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  @Property({ type: BigIntType })
  @Transform(({ value }) => Number(value))
  size!: number;
}
