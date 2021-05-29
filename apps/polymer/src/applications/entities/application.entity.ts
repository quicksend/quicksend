import { Entity, Enum, ManyToOne, Property, Unique } from "@mikro-orm/core";

import { BaseEntity } from "../../common/entities/base.entity";

import { User } from "../../user/entities/user.entity";

import { ApplicationScopes } from "../enums/application-scopes.enum";

import { generateRandomString } from "../../common/utils/generate-random-string.util";

@Entity({
  comment: "Represents an application created by an user"
})
export class Application extends BaseEntity {
  @Property({ comment: "Name of the application" })
  name!: string;

  @ManyToOne(() => User, {
    comment: "The user that created the application",
    eager: true
  })
  owner!: User;

  @Enum({
    array: true,
    comment: "Actions that are allowed by the application",
    default: [ApplicationScopes.READ_PROFILE],
    items: () => ApplicationScopes
  })
  scopes!: ApplicationScopes[];

  @Property({ comment: "The secret of the application that is used as an API key" })
  @Unique()
  secret: string = this.generateSecret();

  generateSecret(): string {
    return generateRandomString(48);
  }
}
