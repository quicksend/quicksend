import * as argon2 from "argon2";

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";

import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent
} from "typeorm";

import { UserEntity } from "./user.entity";

@EventSubscriber()
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(@InjectConnection() readonly connection: Connection) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>) {
    if (event.entity.password) {
      event.entity.password = await argon2.hash(event.entity.password);
    }
  }

  async beforeUpdate(event: UpdateEvent<UserEntity>) {
    if (
      event.entity.password &&
      event.entity.password !== event.databaseEntity.password
    ) {
      event.entity.password = await argon2.hash(event.entity.password);
    }
  }
}
