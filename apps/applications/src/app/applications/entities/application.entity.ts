import {
  BeforeCreate,
  BigIntType,
  Entity,
  Enum,
  PrimaryKey,
  Property,
  Unique
} from "@mikro-orm/core";

import { Application as IApplication, ApplicationScopes } from "@quicksend/types";

import { MaxLength, validateOrReject } from "class-validator";

import { generateRandomString } from "@quicksend/common";

@Entity()
@Unique({ properties: ["name", "owner"] })
export class Application implements IApplication {
  @Property({ type: BigIntType })
  createdAt: number = Date.now();

  @PrimaryKey()
  id: string = generateRandomString();

  @MaxLength(128)
  @Property({ length: 128 })
  name!: string;

  @Property()
  owner!: string;

  @Enum({
    array: true,
    default: [ApplicationScopes.READ_PROFILE],
    items: () => ApplicationScopes
  })
  scopes!: ApplicationScopes[];

  @Property()
  @Unique()
  secret: string = this.generateSecret();

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }

  generateSecret(): string {
    return generateRandomString(48);
  }
}
