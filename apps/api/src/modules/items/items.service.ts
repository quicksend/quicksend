import { Injectable } from "@nestjs/common";

import { FindConditions } from "typeorm";

import { StorageService } from "../storage/storage.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { ItemEntity } from "./item.entity";
import { ItemRepository } from "./item.repository";

import { CreateItemDto } from "./dto/create-item.dto";

import {
  CannotFindItemException,
  ItemConflictException
} from "./item.exceptions";

@Injectable()
export class ItemsService {
  constructor(
    private readonly storageService: StorageService,
    private readonly uowService: UnitOfWorkService
  ) {}

  private get itemRepository() {
    return this.uowService.getCustomRepository(ItemRepository);
  }

  async create(dto: CreateItemDto): Promise<ItemEntity> {
    const duplicate = await this.itemRepository.findOne({ hash: dto.hash });

    if (duplicate) {
      throw new ItemConflictException();
    }

    const newItem = this.itemRepository.create(dto);

    await this.itemRepository.save(newItem);

    return newItem;
  }

  async deleteOne(conditions: FindConditions<ItemEntity>): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne(conditions);

    if (!item) {
      throw new CannotFindItemException();
    }

    await this.itemRepository.remove(item);
    await this.storageService.delete(item.discriminator);

    return item;
  }

  findOne(
    conditions: FindConditions<ItemEntity>
  ): Promise<ItemEntity | undefined> {
    return this.itemRepository.findOne(conditions);
  }
}
