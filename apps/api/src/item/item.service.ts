import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { ItemEntity } from "./item.entity";

import { ItemNotFound } from "./item.exceptions";

@Injectable()
export class ItemService {
  constructor(private readonly uowService: UnitOfWorkService) {}

  private get itemRepository() {
    return this.uowService.getRepository(ItemEntity);
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
