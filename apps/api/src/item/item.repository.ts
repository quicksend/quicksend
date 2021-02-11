import { EntityRepository, Repository } from "typeorm";
import { ReadStream } from "typeorm/platform/PlatformTools";

import { FileEntity } from "../file/file.entity";
import { ItemEntity } from "./item.entity";

@EntityRepository(ItemEntity)
export class ItemRepository extends Repository<ItemEntity> {
  /**
   * Creates the following (simplified) query and return results as a stream:
   *
   * SELECT "discriminator", "id" FROM "item"
   * WHERE NOT EXISTS (
   *   SELECT "itemId" FROM "file"
   *   WHERE "file"."itemId" = "item"."id"
   * )
   * LIMIT 250;
   */
  getOrphanedItems(limit = 0): Promise<ReadStream> {
    return this.createQueryBuilder("item")
      .comment("Find items that don't have any related rows in 'files' table")
      .select(["discriminator", "id"])
      .where((qb) => {
        const inFilesTable = qb
          .subQuery()
          .select("file.itemId")
          .from(FileEntity, "file")
          .where("file.itemId = item.id")
          .getQuery();

        return `NOT EXISTS ${inFilesTable}`;
      })
      .limit(limit)
      .stream();
  }
}
