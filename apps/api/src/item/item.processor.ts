import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { Process, Processor } from "@nestjs/bull";

import { Connection } from "typeorm";
import { Job } from "bull";

import { Counter } from "@quicksend/utils";

import { StorageService } from "../storage/storage.service";
import { ItemService } from "./item.service";
import { UnitOfWorkService } from "../unit-of-work/unit-of-work.service";

import { FileEntity } from "../file/file.entity";
import { ItemEntity } from "./item.entity";

import { DeleteOrphanedItemsJob } from "./jobs/delete-orphaned-items.job";

@Injectable()
@Processor("item")
export class ItemProcessor {
  constructor(
    private readonly itemService: ItemService,
    private readonly storageService: StorageService,
    private readonly uowService: UnitOfWorkService,

    @InjectConnection()
    private readonly connection: Connection
  ) {}

  @Process("deleteOrphanedItems")
  async deleteOrphanedItems(job: Job<DeleteOrphanedItemsJob>): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    const items = await queryRunner.stream(
      // (SELECT discriminator, id FROM "item" AS i WHERE NOT EXISTS (SELECT "itemId" FROM "file" AS f WHERE f."itemId" = i.id)) LIMIT 1000;
      `
      (
        SELECT discriminator, id FROM "${ItemEntity.TABLE_NAME}" AS i
        WHERE NOT EXISTS (
          SELECT "${ItemEntity.TABLE_NAME}Id" FROM "${FileEntity.TABLE_NAME}" AS f
          WHERE f."${ItemEntity.TABLE_NAME}Id" = i.id
        )
      ) LIMIT ${job.data.threshold};
      `
    );

    return new Promise((resolve, reject) => {
      const pendingDeletes = new Counter();

      const releaseQueryRunner = (error?: Error) => {
        return new Promise<void>((res) => {
          pendingDeletes.onceItEqualsTo(0, () => res());
        })
          .then(() => queryRunner.release())
          .then(() => job.progress(100))
          .then(() => (error ? reject(error) : resolve()))
          .catch((err) => reject(err));
      };

      items
        // the arg isn't actually an ItemEntity, just a POJO
        .on("data", async ({ discriminator }: ItemEntity) => {
          pendingDeletes.increment();

          await this.uowService.withTransaction(async () => {
            await this.itemService.deleteOne({ discriminator });
            await this.storageService.delete(discriminator);
          });

          pendingDeletes.decrement();
        })
        .on("end", () => releaseQueryRunner())
        .on("error", (err) => releaseQueryRunner(err));
    });
  }
}
