import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { Counter } from "@quicksend/utils";

import { StorageService } from "../storage/storage.service";
import { TransactionService } from "../transaction/transaction.service";

import { ItemEntity } from "./item.entity";
import { ItemRepository } from "./item.repository";

import {
  DeleteOrphanedItemsJob,
  DELETE_ORPHANED_ITEMS_JOB_NAME
} from "./jobs/delete-orphaned-items.job";

@Injectable()
@Processor(ItemsProcessor.QUEUE_NAME)
export class ItemsProcessor {
  static readonly QUEUE_NAME = "item";

  constructor(
    private readonly storageService: StorageService,
    private readonly transactionService: TransactionService
  ) {}

  private get itemRepository() {
    return this.transactionService.getCustomRepository(ItemRepository);
  }

  @Process(DELETE_ORPHANED_ITEMS_JOB_NAME)
  async deleteOrphanedItems(job: Job<DeleteOrphanedItemsJob>): Promise<void> {
    const stream = await this.itemRepository.getOrphanedItems(job.data.limit);

    const pendingDeletes = new Counter();

    return new Promise((resolve, reject) => {
      stream
        .on("data", (item: Partial<ItemEntity>) => {
          pendingDeletes.increment();

          // TODO: Refactor with nestjs/schedule
          // this.transactionService
          //   .withTransaction(async () => {
          //     if (item.discriminator) {
          //       // Delete from database first because if any error should occur, it will
          //       // happen before the physical file is placed on the deletion queue
          //       await this.itemRepository.delete({
          //         discriminator: item.discriminator
          //       });

          //       await this.storageService.deleteFile(item.discriminator);
          //     }
          //   })
          //   .finally(() => pendingDeletes.decrement());
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
