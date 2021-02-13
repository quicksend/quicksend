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

  get closureAncestorColumnName() {
    return this.closureTable.foreignKeys[0].columnNames[0];
  }

  get closureDescendantColumnName() {
    return this.closureTable.foreignKeys[1].columnNames[0];
  }

  hasDescendant(
    parent: FolderEntity,
    descendant: FolderEntity
  ): Promise<boolean> {
    /**
     * SELECT "id_ancestor", "id_descendant"
     * FROM "folder_closure"
     * WHERE "id_ancestor" = '$1'
     * AND "id_descendant" = '$2'
     * LIMIT 1;
     */
    return this.query(
      `
      SELECT "${this.closureAncestorColumnName}", "${this.closureDescendantColumnName}"
      FROM "${this.closureTable.name}"
      WHERE "${this.closureAncestorColumnName}" = '${parent.id}'
      AND "${this.closureDescendantColumnName}" = '${descendant.id}'
      LIMIT 1;
      `
    ).then(([relationship]) => relationship);
  }

  // https://gist.github.com/kentoj/872cbefc68f68a2a97b6189da9cd6e23#file-closure-table-operations-sql-L45
  async move(source: FolderEntity, destination: FolderEntity) {
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
      DELETE FROM "${this.closureTable.name}"
      WHERE "${this.closureDescendantColumnName}" IN (
        SELECT "${this.closureDescendantColumnName}"
        FROM "${this.closureTable.name}"
        WHERE "${this.closureAncestorColumnName}" = '${source.id}'
      )
      AND "${this.closureAncestorColumnName}" IN (
        SELECT "${this.closureAncestorColumnName}"
        FROM "${this.closureTable.name}"
        WHERE "${this.closureDescendantColumnName}" = '${source.id}'
        AND "${this.closureAncestorColumnName}" != "${this.closureDescendantColumnName}"
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
      INSERT INTO "${this.closureTable.name}" ("${this.closureAncestorColumnName}", "${this.closureDescendantColumnName}")
      SELECT supertree."${this.closureAncestorColumnName}", subtree."${this.closureDescendantColumnName}"
      FROM "${this.closureTable.name}" AS supertree
      CROSS JOIN "${this.closureTable.name}" AS subtree
      WHERE supertree."${this.closureDescendantColumnName}" = '${destination.id}'
      AND subtree."${this.closureAncestorColumnName}" = '${source.id}';
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

    const closureAncestorFkName = closureTableFks[0].name;
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
      FOREIGN KEY ("${this.closureAncestorColumnName}")
      REFERENCES ${this.metadata.tableName}(id)
      ON DELETE CASCADE;

      ALTER TABLE ${this.closureTable.name}
      DROP CONSTRAINT "${closureDescendantFkName}",
      ADD CONSTRAINT "${closureDescendantFkName}"
      FOREIGN KEY ("${this.closureDescendantColumnName}")
      REFERENCES ${this.metadata.tableName}(id)
      ON DELETE CASCADE;
      `
    );
  }
}
