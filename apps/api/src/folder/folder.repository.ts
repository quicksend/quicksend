// TODO: Implements missing delete and move functionality of typeorm's closure table implementation
// Read more at https://github.com/typeorm/typeorm/issues/193
// Once https://github.com/typeorm/typeorm/pull/7156 gets merged, we can remove this custom repository completely

import { EntityRepository, TreeRepository } from "typeorm";

import { FolderEntity } from "./folder.entity";

@EntityRepository(FolderEntity)
export class FolderRepository extends TreeRepository<FolderEntity> {
  get closureTable() {
    return this.metadata.closureJunctionTable;
  }

  hasDescendant(
    parent: FolderEntity,
    descendant: FolderEntity
  ): Promise<boolean> {
    const closureTableFks = this.closureTable.foreignKeys;
    const closureTableName = this.closureTable.name;

    const closureAncestorColumnName = closureTableFks[0].columnNames[0];
    const closureDescendantColumnName = closureTableFks[1].columnNames[0];

    /**
     * SELECT "id_ancestor", "id_descendant"
     * FROM "folder_closure"
     * WHERE "id_ancestor" = '$1'
     * AND "id_descendant" = '$2'
     * LIMIT 1
     */
    return this.query(
      `
      SELECT "${closureAncestorColumnName}", "${closureDescendantColumnName}"
      FROM "${closureTableName}"
      WHERE "${closureAncestorColumnName}" = '${parent.id}'
      AND "${closureDescendantColumnName}" = '${descendant.id}'
      LIMIT 1
      `
    ).then(([relationship]) => relationship);
  }

  // https://gist.github.com/kentoj/872cbefc68f68a2a97b6189da9cd6e23#file-closure-table-operations-sql-L45
  async move(source: FolderEntity, destination: FolderEntity) {
    const closureTableFks = this.closureTable.foreignKeys;
    const closureTableName = this.closureTable.name;

    const closureAncestorColumnName = closureTableFks[0].columnNames[0];
    const closureDescendantColumnName = closureTableFks[1].columnNames[0];

    /**
     * DELETE FROM "folder_closure"
     * WHERE "id_descendant" IN (
     *   SELECT "id_descendant"
     *   FROM "folder_closure"
     *   WHERE "id_ancestor" = '$1'
     * )
     * AND "id_ancestor" IN (
     *  SELECT "id_ancestor"
     *  FROM "folder_closure"
     *  WHERE "id_descendant" = '$1'
     *  AND "id_ancestor" != "id_descendant"
     * );
     */
    await this.query(
      `
      DELETE FROM "${closureTableName}"
      WHERE "${closureDescendantColumnName}" IN (
        SELECT "${closureDescendantColumnName}"
        FROM "${closureTableName}"
        WHERE "${closureAncestorColumnName}" = '${source.id}'
      )
      AND "${closureAncestorColumnName}" IN (
        SELECT "${closureAncestorColumnName}"
        FROM "${closureTableName}"
        WHERE "${closureDescendantColumnName}" = '${source.id}'
        AND "${closureAncestorColumnName}" != "${closureDescendantColumnName}"
      );
      `
    );

    /**
     * INSERT INTO "folder_closure" ("id_ancestor", "id_descendant")
     * SELECT supertree."id_ancestor", subtree."id_descendant"
     * FROM "folder_closure" AS supertree
     * CROSS JOIN "folder_closure" AS subtree
     * WHERE supertree."id_descendant" = '$1'
     * AND subtree."id_ancestor" = '$2';
     */
    await this.query(
      `
      INSERT INTO "${closureTableName}" ("${closureAncestorColumnName}", "${closureDescendantColumnName}")
      SELECT supertree."${closureAncestorColumnName}", subtree."${closureDescendantColumnName}"
      FROM "${closureTableName}" AS supertree
      CROSS JOIN "${closureTableName}" AS subtree
      WHERE supertree."${closureDescendantColumnName}" = '${destination.id}'
      AND subtree."${closureAncestorColumnName}" = '${source.id}';
      `
    );

    source.parent = destination;

    return this.save(source);
  }

  // https://github.com/typeorm/typeorm/issues/193#issuecomment-505002639
  $setupCascadeDeleteFks() {
    const closureTableFks = this.closureTable.foreignKeys;
    const treeRelationFks = this.metadata.treeParentRelation!.foreignKeys[0]; // cannot be null since this is a tree repository

    const parentIdColumnName = treeRelationFks.columnNames[0];
    const parentIdFkName = treeRelationFks.name;

    const closureAncestorColumnName = closureTableFks[0].columnNames[0];
    const closureAncestorFkName = closureTableFks[0].name;

    const closureDescendantColumnName = closureTableFks[1].columnNames[0];
    const closureDescendantFkName = closureTableFks[1].name;

    return this.query(
      `
      ALTER TABLE ${this.metadata.tableName}
      DROP CONSTRAINT "${parentIdFkName}",
      ADD CONSTRAINT "${parentIdFkName}"
      FOREIGN KEY ("${parentIdColumnName}")
      REFERENCES ${this.metadata.tableName}(id)
      ON DELETE CASCADE;

      ALTER TABLE ${this.closureTable.name}
      DROP CONSTRAINT "${closureAncestorFkName}",
      ADD CONSTRAINT "${closureAncestorFkName}"
      FOREIGN KEY ("${closureAncestorColumnName}")
      REFERENCES ${this.metadata.tableName}(id)
      ON DELETE CASCADE;

      ALTER TABLE ${this.closureTable.name}
      DROP CONSTRAINT "${closureDescendantFkName}",
      ADD CONSTRAINT "${closureDescendantFkName}"
      FOREIGN KEY ("${closureDescendantColumnName}")
      REFERENCES ${this.metadata.tableName}(id)
      ON DELETE CASCADE;
      `
    );
  }
}
