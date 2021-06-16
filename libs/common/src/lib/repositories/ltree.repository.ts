import { EntityRepository } from "@mikro-orm/postgresql";
import { EntityData, QBFilterQuery, QueryOrder } from "@mikro-orm/core";

export interface LTreeEntity {
  id: string;
  path: string;
}

// https://www.postgresql.org/docs/current/ltree.html
export class LTreeRepository<Entity extends LTreeEntity> extends EntityRepository<Entity> {
  async findClosestAncestor(path: string, filter?: QBFilterQuery<Entity>): Promise<Entity | null> {
    const queryBuilder = this.createQueryBuilder().select("*").where("path @> ?", [path]);

    if (filter) {
      queryBuilder.andWhere(filter);
    }

    return queryBuilder
      .orderBy({ ["nlevel(path)"]: QueryOrder.DESC }) // Get the parent that is closest to the path
      .limit(1)
      .getSingleResult();
  }

  async hasDescendant(parent: string, descendant: string): Promise<boolean> {
    const node = await this.createQueryBuilder()
      .select("*")
      .where("path = ?", [parent])
      .andWhere("path <@ ?", [descendant])
      .getSingleResult();

    return !!node;
  }

  async insertLeafNode(node: Entity, parent: Entity): Promise<Entity> {
    node.path = `${parent.path}.${node.id}`;

    await this.persistAndFlush(node);

    return node;
  }

  async insertRootNode(node: Entity): Promise<Entity> {
    node.path = node.id;

    await this.persistAndFlush(node);

    return node;
  }

  async moveSubtree(source: string, destination: string): Promise<void> {
    await this.createQueryBuilder()
      .update({
        path: this.getKnex().raw(`? || subpath(path, nlevel(?) - 1)`, [destination, source])
      })
      .where("path <@ ?", [source])
      .execute();
  }

  async removeDescendants(parent: string): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .where("path != ?", [parent])
      .andWhere("path <@ ?", [parent])
      .execute();
  }

  async removeSubtree(parent: string): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .where("path <@ ?", [parent])
      .execute(); // prettier-ignore
  }

  async updateAncestors(node: string, data: EntityData<Entity>): Promise<void> {
    await this.createQueryBuilder()
      .update(data)
      .where("path != ?", [node])
      .andWhere("path @> ?", [node])
      .execute();
  }

  async updateDescendants(parent: string, data: EntityData<Entity>): Promise<void> {
    await this.createQueryBuilder()
      .update(data)
      .where("path != ?", [parent])
      .andWhere("path <@ ?", [parent])
      .execute();
  }

  async updateSubtree(parent: string, data: EntityData<Entity>): Promise<void> {
    await this.createQueryBuilder()
      .update(data)
      .where("path <@ ?", [parent])
      .execute(); // prettier-ignore
  }
}
