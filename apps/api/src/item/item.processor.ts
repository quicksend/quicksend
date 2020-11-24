import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { Process, Processor } from "@nestjs/bull";

import { Connection } from "typeorm";
import { Job } from "bull";

import { Counter } from "@quicksend/utils";

import { StorageService } from "../storage/storage.service";
import { ItemService } from "./item.service";

import { FileEntity } from "../file/file.entity";
import { ItemEntity } from "./item.entity";

@Injectable()
@Processor("item")
export class ItemProcessor {
  constructor(
    private readonly itemService: ItemService,
    private readonly storageService: StorageService,

    @InjectConnection()
    private readonly connection: Connection
  ) {}

  @Process("cleanUpOrphanedItems")
  async cleanUpOrphanedItems(job: Job): Promise<void> {
    console.log(this.connection);
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    const COLUMN_NAME = `${ItemEntity.TABLE_NAME}Id`;
    const LIMIT = 1000;

    // SELECT * FROM "item" AS i WHERE NOT EXISTS (SELECT "itemId" FROM "file" AS f WHERE f."itemId" = i.id) LIMIT 1000;
    const items = await queryRunner.stream(
      `SELECT * FROM "${ItemEntity.TABLE_NAME}" AS i WHERE NOT EXISTS (SELECT "${COLUMN_NAME}" FROM "${FileEntity.TABLE_NAME}" AS f WHERE f."${COLUMN_NAME}" = i.id) LIMIT ${LIMIT}`
    );

    return new Promise((resolve, reject) => {
      const pendingDeletes = new Counter();

      const releaseQueryRunner = (error?: Error) => {
        return new Promise((res) => pendingDeletes.onceItEqualsTo(0, res))
          .then(() => queryRunner.release())
          .then(() => job.progress(100))
          .then(() => (error ? reject(error) : resolve()))
          .catch((err) => reject(err));
      };

      items
        // item isn't actually an ItemEntity, just a POJO
        .on("data", async (item: ItemEntity) => {
          const { discriminator } = item;

          console.log(item);

          pendingDeletes.increment();

          await queryRunner.startTransaction();

          try {
            await this.itemService.deleteOne({ discriminator });
            await this.storageService.delete(discriminator);

            pendingDeletes.decrement();
            await queryRunner.commitTransaction();
          } catch (error) {
            pendingDeletes.decrement();
            await queryRunner.rollbackTransaction();
          }
        })
        .on("end", () => releaseQueryRunner())
        .on("error", (err) => releaseQueryRunner(err));
    });
  }
}
