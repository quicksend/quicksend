import { BeforeCreate, Entity, Enum, PrimaryKey, Property, Unique } from "@mikro-orm/core";

import { generateRandomString } from "@quicksend/common";

import { MaxLength, validateOrReject } from "class-validator";

import { Scope } from "../enums/scope.enum";

@Entity()
@Unique({ properties: ["createdBy", "name"] })
export class Application {
  @Property()
  createdAt: Date;

  @Property()
  createdBy!: string;

  @PrimaryKey()
  id: string;

  @MaxLength(128)
  @Property()
  name!: string;

  @Enum({
    array: true,
    items: () => Scope
  })
  scopes: Scope[];

  @Property()
  @Unique()
  secret: string;

  // prettier-ignore
  constructor(application: {
    createdAt?: Date;
    createdBy: string;
    name: string;
    scopes: Scope[];
  }) {
    this.createdAt = application.createdAt || new Date();
    this.createdBy = application.createdBy;
    this.name = application.name;
    this.id = generateRandomString();
    this.scopes = application.scopes;
    this.secret = this.generateSecret();
  }

  generateSecret(): string {
    return generateRandomString(48);
  }

  @BeforeCreate()
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
