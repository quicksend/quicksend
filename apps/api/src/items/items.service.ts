import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { FindConditions } from "typeorm";
import { Queue } from "bull";

import { TransmitService } from "@quicksend/nest-transmit";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { ItemEntity } from "./item.entity";
import { ItemRepository } from "./item.repository";

import { ItemsProcessor } from "./items.processor";

import { CannotFindItemException } from "./items.exceptions";

import { DELETE_ITEM_JOB_NAME } from "./jobs/delete-item.job";

@Injectable()
export class ItemsService {
  constructor(
    private readonly transmitService: TransmitService,
    private readonly uowService: UnitOfWorkService,

    @InjectQueue(ItemsProcessor.QUEUE_NAME)
    private readonly itemsProcessor: Queue
  ) {}

  private get itemRepository() {
    return this.uowService.getCustomRepository(ItemRepository);
  }

  get manager() {
    return this.transmitService.manager;
  }

  /**
   * Delete an item from the database and place the physical file onto the deletion queue
   */
  async deleteOne(conditions: FindConditions<ItemEntity>): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne(conditions);

    if (!item) {
      throw new CannotFindItemException();
    }

    await this.itemRepository.remove(item);

    await this.itemsProcessor.add(DELETE_ITEM_JOB_NAME, {
      discriminator: item.discriminator
    });

    return item;
  }

  /**
   * Find an item or returns undefined if it does not exist
   */
  findOne(
    conditions: FindConditions<ItemEntity>
  ): Promise<ItemEntity | undefined> {
    return this.itemRepository.findOne(conditions);
  }

  /**
   * Create a new item if it does not already exist
   */
  async grabOne(
    discriminator: string,
    hash: string,
    size: number
  ): Promise<ItemEntity> {
    const duplicate = await this.itemRepository.findOne({ hash });

    if (duplicate) {
      return duplicate;
    }

    const item = this.itemRepository.create({
      discriminator,
      hash,
      size
    });

    await this.itemRepository.save(item);

    return item;
  }

  /**
   * Finds an item and creates a readable stream
   */
  async read(
    conditions: FindConditions<ItemEntity>
  ): Promise<NodeJS.ReadableStream> {
    const item = await this.itemRepository.findOne(conditions);

    if (!item) {
      throw new CannotFindItemException();
    }

    return this.transmitService.read(item.discriminator);
  }
}
