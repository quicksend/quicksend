import { Constructor } from "@mikro-orm/core";
import { EntityRepository, Knex } from "@mikro-orm/postgresql";

type Node = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface ClosureTable<Entity> extends EntityRepository<Entity> {
  containsDescendant(parent: Node, descendant: Node): Promise<boolean>;
  deleteSubtree(node: Node): Promise<void>;
  insertLeafNode(leaf: Node, parent: Node): Promise<void>;
  insertRootNode(root: Node): Promise<void>;
  moveSubtree(source: Node, destination: Node): Promise<void>;
}

export interface ClosureTableRepositoryOptions {
  ancestorColumn: string;
  depthColumn: string;
  descendantColumn: string;
}

export const ClosureTableRepository = <Entity>(
  options: ClosureTableRepositoryOptions
): Constructor<ClosureTable<Entity>> => {
  class ClosureTableMixinRepository
    extends EntityRepository<Entity>
    implements ClosureTable<Entity> {
    private readonly ancestorColumn = this.getColumnName(options.ancestorColumn);
    private readonly depthColumn = this.getColumnName(options.depthColumn);
    private readonly descendantColumn = this.getColumnName(options.descendantColumn);
    private readonly tableName = this.getTableName(this.entityName.toString());

    private get knex(): Knex {
      return this.em.getKnex();
    }

    async containsDescendant(parent: Node, descendant: Node): Promise<boolean> {
      const hasDescendant = await this.createQueryBuilder()
        .select("*")
        .where({
          [this.ancestorColumn]: parent,
          [this.descendantColumn]: descendant
        })
        .limit(1)
        .getSingleResult();

      return !!hasDescendant;
    }

    async deleteSubtree(node: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName)
          .delete()
          .whereIn(
            this.descendantColumn,
            this.knex
              .select(this.descendantColumn)
              .from(this.tableName)
              .where(this.ancestorColumn, node)
          )
      );
    }

    async insertLeafNode(leaf: Node, parent: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName).insert(
          this.knex
            .select(
              this.ancestorColumn,
              this.knex.raw("?", leaf),
              this.knex.raw(`${this.depthColumn} + 1`)
            )
            .from(this.tableName)
            .where(this.descendantColumn, parent)
            .unionAll(
              this.knex.select(
                this.knex.raw("?", leaf),
                this.knex.raw("?", leaf),
                this.knex.raw("?", 0)
              )
            )
        )
      );
    }

    async insertRootNode(root: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName).insert({
          [this.ancestorColumn]: root,
          [this.depthColumn]: 0,
          [this.descendantColumn]: root
        })
      );
    }

    async moveSubtree(source: Node, destination: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName)
          .delete()
          .whereIn(
            this.descendantColumn,
            this.knex
              .select(this.descendantColumn)
              .from(this.tableName)
              .where(this.ancestorColumn, source)
          )
          .whereIn(
            this.ancestorColumn,
            this.knex
              .select(this.ancestorColumn)
              .from(this.tableName)
              .where(this.descendantColumn, source)
              .andWhereNot(this.ancestorColumn, this.knex.ref(this.descendantColumn))
          )
      );

      await this.em.execute(
        this.knex(this.tableName).insert(
          this.knex
            .select(
              this.knex.ref(`supertree.${this.ancestorColumn}`),
              this.knex.ref(`subtree.${this.descendantColumn}`),
              // can't use .ref() here because knex gets confused with the + operator
              this.knex.raw(`supertree.${this.depthColumn} + subtree.${this.depthColumn} + 1`)
            )
            .from({ supertree: this.tableName })
            .crossJoin(this.knex.ref(`${this.tableName} as subtree`))
            .where(`supertree.${this.descendantColumn}`, destination)
            .andWhere(`subtree.${this.ancestorColumn}`, source)
        )
      );
    }

    private getColumnName(columnName: string): string {
      return this.em.config.getNamingStrategy().propertyToColumnName(columnName);
    }

    private getTableName(entityName: string): string {
      return this.em.config.getNamingStrategy().classToTableName(entityName);
    }
  }

  return ClosureTableMixinRepository;
};
