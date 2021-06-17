import { BigIntType, Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class UserEvent {
  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @PrimaryKey()
  id!: number;

  @Property({
    nullable: true,
    type: BigIntType
  })
  lastPublished?: number;

  @Property()
  pattern!: string;

  @Property()
  payload!: string;
}
