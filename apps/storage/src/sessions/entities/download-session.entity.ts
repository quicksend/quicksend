import { BigIntType, Entity, PrimaryKey, Property } from "@mikro-orm/core";

import { DownloadSession as IDownloadSession } from "@quicksend/types";

import { generateRandomString } from "@quicksend/common";

@Entity()
export class DownloadSession implements IDownloadSession {
  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @Property()
  expiresAt!: number;

  @Property()
  hash!: string;

  @PrimaryKey()
  id: string = generateRandomString();

  @Property()
  owner!: string;
}
