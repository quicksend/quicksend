import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { FindConditions } from "typeorm";
import { Queue } from "bull";

import { config } from "@quicksend/config";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { ItemEntity } from "./item.entity";

import { ItemNotFound } from "./item.exceptions";

@Injectable()
export class ItemService implements OnApplicationBootstrap {
  constructor(
    private readonly uowService: UnitOfWorkService,

    @InjectQueue("item")
    private readonly itemProcessor: Queue
  ) {}

  private get itemRepository() {
    return this.uowService.getRepository(ItemEntity);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.itemProcessor.removeJobs("*");
    await this.itemProcessor.add(
      "deleteOrphanedItems",
      {
        threshold: config.get("advanced").garbageCollector.threshold
      },
      {
        removeOnComplete: true,
        repeat: {
          every: config.get("advanced").garbageCollector.frequency
        }
      }
    );
  }

  async create(payload: {
    discriminator: string;
    hash: string;
    size: number;
  }): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne({ hash: payload.hash });
    if (item) return item;

    const newItem = this.itemRepository.create(payload);

    await this.itemRepository.save(newItem);

    return newItem;
  }

  async deleteOne(conditions: FindConditions<ItemEntity>): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne(conditions);
    if (!item) throw new ItemNotFound();

    await this.itemRepository.remove(item);

    return item;
  }

  findOne(
    conditions: FindConditions<ItemEntity>
  ): Promise<ItemEntity | undefined> {
    return this.itemRepository.findOne(conditions);
  }
}
