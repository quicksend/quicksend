import { BigIntType, Entity, PrimaryKey, Property } from "@mikro-orm/core";

import { UploadSession as IUploadSession } from "@quicksend/types";

import { generateRandomString } from "@quicksend/common";

@Entity()
export class UploadSession implements IUploadSession {
  @Property({
    nullable: true,
    type: BigIntType
  })
  commitedAt?: number;

  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @Property()
  expiresAt!: number;

  @PrimaryKey()
  id: string = generateRandomString();

  @Property()
  owner!: string;
}
