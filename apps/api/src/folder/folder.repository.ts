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

    // SELECT id_ancestor, id_descendant FROM "folder_closure" "folder_closure" WHERE id_ancestor = $1 AND id_descendant = $2
    return this.manager
      .createQueryBuilder()
      .select([closureAncestorColumnName, closureDescendantColumnName])
      .from(closureTableName, closureTableName)
      .where(`${closureAncestorColumnName} = :ancestorId`, {
        ancestorId: parent.id
      })
      .andWhere(`${closureDescendantColumnName} = :descendantId`, {
        descendantId: descendant.id
      })
      .limit(1)
      .getCount()
      .then((count) => Boolean(count));
  }

  // https://gist.github.com/kentoj/872cbefc68f68a2a97b6189da9cd6e23#file-closure-table-operations-sql-L45
  async move(source: FolderEntity, destination: FolderEntity) {
    const closureTableFks = this.closureTable.foreignKeys;
    const closureTableName = this.closureTable.name;

    const closureAncestorColumnName = closureTableFks[0].columnNames[0];
    const closureDescendantColumnName = closureTableFks[1].columnNames[0];

    /**
     * DELETE FROM TreePaths
     * WHERE descendant IN (
     *   SELECT descendant
     *   FROM TreePaths
     *   WHERE ancestor = 6
     * )
     * AND ancestor IN (
     *  SELECT ancestor
     *  FROM TreePaths
     *  WHERE descendant = 6
     *  AND ancestor != descendant
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
     * INSERT INTO TreePaths (ancestor, descendant)
     * SELECT supertree.ancestor, subtree.descendant
     * FROM TreePaths AS supertree
     * CROSS JOIN TreePaths AS subtree
     * WHERE supertree.descendant = 3
     * AND subtree.ancestor = 6;
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
