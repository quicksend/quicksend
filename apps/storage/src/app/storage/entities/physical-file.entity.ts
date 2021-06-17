import { BeforeCreate, BigIntType, Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

import { Min, validateOrReject } from "class-validator";

@Entity()
export class PhysicalFile {
  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @PrimaryKey()
  hash!: string;

  @Property()
  @Unique()
  name!: string;

  @Min(0)
  @Property({ unsigned: true })
  size!: number;

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
