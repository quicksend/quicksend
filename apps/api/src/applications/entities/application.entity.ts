import { BeforeCreate, Entity, Enum, ManyToOne, Property, Unique } from "@mikro-orm/core";

import { BaseEntity } from "../../common/entities/base.entity";

import { User } from "../../user/entities/user.entity";

import { ApplicationScopes } from "../enums/application-scopes.enum";

import { generateRandomString } from "../../common/utils/generate-random-string.util";

@Entity()
export class Application extends BaseEntity {
  @Property()
  name!: string;

  @Enum({
    array: true,
    default: [
      ApplicationScopes.BROWSE_FOLDERS,
      ApplicationScopes.READ_PROFILE,
      ApplicationScopes.VIEW_FILES
    ],
    items: () => ApplicationScopes
  })
  scopes!: ApplicationScopes[];

  @Property()
  @Unique()
  secret!: string;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: "CASCADE"
  })
  user!: User;

  @BeforeCreate()
  async beforeCreate(): Promise<void> {
    this.secret = await this.generateSecret();

    return super.beforeCreate();
  }

  generateSecret(): Promise<string> {
    return generateRandomString(48);
  }
}
