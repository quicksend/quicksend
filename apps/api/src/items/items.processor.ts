import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Process, Processor } from "@nestjs/bull";

import { Job, Queue } from "bull";

import { Counter } from "@quicksend/utils";

import { TransmitService } from "@quicksend/nest-transmit";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { ItemEntity } from "./item.entity";
import { ItemRepository } from "./item.repository";

import { DeleteItemJob, DELETE_ITEM_JOB_NAME } from "./jobs/delete-item.job";

import {
  DeleteOrphanedItemsJob,
  DELETE_ORPHANED_ITEMS_JOB_NAME
} from "./jobs/delete-orphaned-items.job";

@Injectable()
@Processor(ItemsProcessor.QUEUE_NAME)
export class ItemsProcessor {
  static readonly QUEUE_NAME = "item";

  constructor(
    private readonly transmitService: TransmitService,
    private readonly uowService: UnitOfWorkService,

    @InjectQueue("item")
    private readonly itemsProcessor: Queue
  ) {}

  private get itemRepository() {
    return this.uowService.getCustomRepository(ItemRepository);
  }

  @Process(DELETE_ITEM_JOB_NAME)
  async deleteItem(job: Job<DeleteItemJob>): Promise<void> {
    return this.transmitService.delete(job.data.discriminator);
  }

  @Process(DELETE_ORPHANED_ITEMS_JOB_NAME)
  async deleteOrphanedItems(job: Job<DeleteOrphanedItemsJob>): Promise<void> {
    const stream = await this.itemRepository.getOrphanedItems(job.data.limit);

    const pendingDeletes = new Counter();

    return new Promise((resolve, reject) => {
      stream
        .on("data", (item: Partial<ItemEntity>) => {
          pendingDeletes.increment();

          this.uowService
            .withTransaction(async () => {
              if (item.discriminator) {
                // Delete from database first because if any error should occur, it will
                // happen before the physical file is placed on the deletion queue
                await this.itemRepository.delete({
                  discriminator: item.discriminator
                });

                await this.itemsProcessor.add("delete", {
                  discriminator: item.discriminator
                });
              }
            })
            .finally(() => pendingDeletes.decrement());
        })
        .on("end", () => {
          pendingDeletes.onceItEqualsTo(0, () => resolve());
        })
        .on("error", (error: Error) => {
          pendingDeletes.onceItEqualsTo(0, () => reject(error));
        });
    });
  }
}
