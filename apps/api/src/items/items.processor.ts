import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { Counter } from "@quicksend/utils";

import { ItemsService } from "./items.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { ItemEntity } from "./item.entity";
import { ItemRepository } from "./item.repository";

import { DeleteOrphanedItemsJob } from "./jobs/delete-orphaned-items.job";

@Injectable()
@Processor("item")
export class ItemsProcessor {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly uowService: UnitOfWorkService
  ) {}

  private get itemsRepository() {
    return this.uowService.getCustomRepository(ItemRepository);
  }

  @Process("deleteOrphanedItems")
  async deleteOrphanedItems(job: Job<DeleteOrphanedItemsJob>): Promise<void> {
    const stream = await this.itemsRepository.getOrphanedItems(
      job.data.threshold
    );

    return new Promise((resolve, reject) => {
      const pendingDeletes = new Counter();

      stream
        .on("data", (item: Partial<ItemEntity>) => {
          pendingDeletes.increment();

          this.uowService
            .withTransaction(() => this.itemsService.deleteOne(item))
            .finally(() => pendingDeletes.decrement());
        })
        .on("end", () => {
          pendingDeletes.onceItEqualsTo(0, () => {
            job.progress(100).then(() => resolve());
          });
        })
        .on("error", (error: Error) => {
          pendingDeletes.onceItEqualsTo(0, () => reject(error));
        });
    });
  }
}
