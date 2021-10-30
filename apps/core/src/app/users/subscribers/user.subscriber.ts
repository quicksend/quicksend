import argon2 from "argon2";

import { EventArgs, EntityName, EventSubscriber, Subscriber } from "@mikro-orm/core";

import { Injectable } from "@nestjs/common";

import { User } from "../entities/user.entity";

@Injectable()
@Subscriber()
export class UserSubscriber implements EventSubscriber<User> {
  getSubscribedEntities(): EntityName<User>[] {
    return [User];
  }

  async beforeCreate(event: EventArgs<User>): Promise<void> {
    if (event.changeSet) {
      event.changeSet.payload.password = await argon2.hash(event.changeSet.payload.password);
    }
  }

  async beforeUpdate(event: EventArgs<User>): Promise<void> {
    if (
      event.changeSet &&
      event.changeSet.originalEntity &&
      event.changeSet.payload.password &&
      event.changeSet.payload.password !== event.changeSet.originalEntity.password
    ) {
      event.changeSet.payload.password = await argon2.hash(event.changeSet.payload.password);
    }
  }
}
