import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { StorageService } from "../storage/storage.service";
import { TransactionService } from "../transaction/transaction.service";

import { ItemEntity } from "./item.entity";
import { ItemRepository } from "./item.repository";

import { CannotFindItemException } from "./items.exceptions";

@Injectable()
export class ItemsService {
  constructor(
    private readonly storageService: StorageService,
    private readonly transactionService: TransactionService
  ) {}

  private get itemRepository() {
    return this.transactionService.getCustomRepository(ItemRepository);
  }

  /**
   * Finds an item and creates a readable stream
   */
  async createReadableStream(
    conditions: FindConditions<ItemEntity>
  ): Promise<NodeJS.ReadableStream> {
    const item = await this.itemRepository.findOne(conditions);

    if (!item) {
      throw new CannotFindItemException();
    }

    return this.storageService.createReadableStream(item.discriminator);
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

    await this.storageService.deleteFile(item.discriminator);

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
}
