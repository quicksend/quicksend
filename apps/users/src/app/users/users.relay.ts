import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { EntityManager, EntityRepository, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { InjectRepository } from "@mikro-orm/nestjs";

import { EventPattern } from "@quicksend/types";
import { NatsClient } from "@quicksend/nestjs-nats";

import { Config } from "../config/config.interface";

import { UserEvent } from "./entities/user-event.entity";

interface PublishOptions<Pattern extends EventPattern<string, string, string>, Payload> {
  pattern: Pattern;
  payload: (entityManager: EntityManager) => Payload;
}

/**
 * Allows you to atomically dispatch an event and write to the database
 */
@Injectable()
export class UsersRelay {
  private readonly client: NatsClient;

  constructor(
    private readonly configService: ConfigService<Config>,

    private readonly entityManager: EntityManager<PostgreSqlDriver>,

    @InjectRepository(UserEvent)
    private readonly userEventRepository: EntityRepository<UserEvent>
  ) {
    this.client = new NatsClient({
      connection: {
        servers: [this.configService.get("NATS_URL") as string]
      }
    });
  }

  async publish<Pattern extends EventPattern<string, string, string>, Payload>(
    options: PublishOptions<Pattern, Payload>
  ): Promise<Payload> {
    const { pattern, payload } = options;

    const entityManager = this.entityManager.fork(false);

    await entityManager.begin();

    let event;
    let result;

    try {
      result = await payload(entityManager);

      event = new UserEvent();
      event.pattern = JSON.stringify(pattern);
      event.payload = JSON.stringify(result);

      await entityManager.persist(event);
      await entityManager.commit();
    } catch (error) {
      await entityManager.rollback();

      throw error;
    }

    await this.emit(event, false);

    return result;
  }

  async emit(event: UserEvent, throwErrors = true): Promise<boolean> {
    try {
      await this.client.emitAsync(JSON.parse(event.pattern), JSON.parse(event.payload));

      event.lastPublished = Date.now();

      await this.userEventRepository.persistAndFlush(event);

      return true;
    } catch (error) {
      if (throwErrors) {
        throw error;
      }

      Logger.error(error.message, error.stack);

      return false;
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async retryUnpublishedEvents(): Promise<void> {
    const events = this.userEventRepository
      .createQueryBuilder()
      .where({ lastPublished: null })
      .getKnexQuery()
      .stream();

    for await (const event of events) {
      const mappedEntity = this.entityManager.map(UserEvent, event);

      await this.emit(mappedEntity);
    }
  }
}
