import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { getRepository } from "typeorm";

import { FolderController } from "./folder.controller";
import { FolderEntity } from "./folder.entity";
import { FolderService } from "./folder.service";

import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

@Module({
  imports: [TypeOrmModule.forFeature([FolderEntity]), UnitOfWorkModule],
  controllers: [FolderController],
  exports: [FolderService],
  providers: [FolderService]
})
export class FolderModule implements OnModuleInit {
  // TODO: Literally the ugliest hack ever until https://github.com/typeorm/typeorm/pull/7156 gets merged
  // https://github.com/typeorm/typeorm/issues/193#issuecomment-505002639
  async onModuleInit() {
    const folderRepository = getRepository(FolderEntity);

    const closureTable = folderRepository.metadata.closureJunctionTable;
    const tableName = folderRepository.metadata.tableName;

    // treeParentRelation cannot be null since folder repository is a tree repository
    const treeRelationFks = folderRepository.metadata.treeParentRelation!.foreignKeys[0]; // prettier-ignore

    const parentIdColumnName = treeRelationFks.columnNames[0];
    const parentIdFkName = treeRelationFks.name;

    // prettier-ignore
    const closureAncestorColumnName = closureTable.foreignKeys[0].columnNames[0];
    const closureAncestorFkName = closureTable.foreignKeys[0].name;

    // prettier-ignore
    const closureDescendantColumnName = closureTable.foreignKeys[1].columnNames[0];
    const closureDescendantFkName = closureTable.foreignKeys[1].name;

    await folderRepository.query(
      `
      ALTER TABLE ${tableName}
      DROP CONSTRAINT "${parentIdFkName}",
      ADD CONSTRAINT "${parentIdFkName}"
      FOREIGN KEY ("${parentIdColumnName}")
      REFERENCES ${tableName}(id)
      ON DELETE CASCADE;

      ALTER TABLE ${closureTable.name}
      DROP CONSTRAINT "${closureAncestorFkName}",
      ADD CONSTRAINT "${closureAncestorFkName}"
      FOREIGN KEY ("${closureAncestorColumnName}")
      REFERENCES ${tableName}(id)
      ON DELETE CASCADE;

      ALTER TABLE ${closureTable.name}
      DROP CONSTRAINT "${closureDescendantFkName}",
      ADD CONSTRAINT "${closureDescendantFkName}"
      FOREIGN KEY ("${closureDescendantColumnName}")
      REFERENCES ${tableName}(id)
      ON DELETE CASCADE;
      `
    );
  }
}
