import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Profile {
  @Property({
    nullable: true
  })
  avatar?: string;

  @Property()
  createdAt: Date;

  @Property()
  displayName: string;

  @PrimaryKey()
  user: string;

  // prettier-ignore
  constructor(profile: {
    avatar?: string;
    createdAt?: Date;
    displayName: string;
    user: string;
  }) {
    this.avatar = profile.avatar;
    this.createdAt = profile.createdAt || new Date();
    this.displayName = profile.displayName;
    this.user = profile.user;
  }
}
