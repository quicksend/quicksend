import { BaseEntity, EntityData, Index, PrimaryKey, Property, QueryOrder } from "@mikro-orm/core";

import { EntityRepository, QueryBuilder } from "@mikro-orm/postgresql";

import { generateRandomString } from "@quicksend/common";

type NodeLike<Node> = Node | string;
type PathLike = LTreeNode | string;
type QueryBuilderFunction<T> = (queryBuilder: QueryBuilder<T>) => Promise<void> | void;

export abstract class LTreeNode extends BaseEntity<LTreeNode, "id"> {
  static readonly PATH_DELIMITER = ".";

  @PrimaryKey()
  readonly id: string;

  @Index({
    type: "gist"
  })
  @Property({
    columnType: "ltree"
  })
  path: string;

  constructor() {
    super();
    this.id = generateRandomString();
    this.path = this.id;
  }

  static joinPaths(...pathLike: PathLike[]): string {
    const paths = pathLike.map((pathLike) => {
      if (pathLike instanceof LTreeNode) {
        return pathLike.path;
      }

      return pathLike;
    });

    return paths.join(LTreeNode.PATH_DELIMITER);
  }

  setParentPath(...pathLike: PathLike[]): void {
    this.path = LTreeNode.joinPaths(...pathLike, this.id);
  }

  setPath(...pathLike: PathLike[]): void {
    this.path = LTreeNode.joinPaths(...pathLike);
  }
}

/**
 * @see https://www.postgresql.org/docs/current/ltree.html
 */
export class LTreeRepository<Node extends LTreeNode> extends EntityRepository<Node> {
  async containsDescendant(
    parent: NodeLike<Node>,
    descendant: NodeLike<Node>,
    qb?: QueryBuilderFunction<Node>
  ): Promise<Node | null> {
    const [parentPath, descendantPath] = await Promise.all([
      this.getPath(parent),
      this.getPath(descendant)
    ]);

    const queryBuilder = this.createQueryBuilder()
      .select("*")
      .where("path = ?", [parentPath])
      .andWhere("path <@ ?", [descendantPath]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.limit(1).getSingleResult();
  }

  async countDescendants(parent: NodeLike<Node>, qb?: QueryBuilderFunction<Node>): Promise<number> {
    const path = await this.getPath(parent);

    const queryBuilder = this.createQueryBuilder().count().where("path <@ ?", [path]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.execute();
  }

  async findAncestor(node: NodeLike<Node>, qb?: QueryBuilderFunction<Node>): Promise<Node | null> {
    const path = await this.getPath(node);

    const queryBuilder = this.createQueryBuilder().select("*").where("path @> ?", [path]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.limit(1).getSingleResult();
  }

  async findClosestAncestor(
    node: NodeLike<Node>,
    qb?: QueryBuilderFunction<Node>
  ): Promise<Node | null> {
    const path = await this.getPath(node);

    // Get the closest ancestor by sorting the depth of the node. The largest depth is the closest ancestor.
    const queryBuilder = this.createQueryBuilder()
      .select("*")
      .where("path @> ?", [path])
      .orderBy({
        ["nlevel(path)"]: QueryOrder.DESC
      });

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.limit(1).getSingleResult();
  }

  async moveSubtree(
    source: NodeLike<Node>,
    destination: NodeLike<Node>,
    qb?: QueryBuilderFunction<Node>
  ): Promise<void> {
    const [sourcePath, destinationPath] = await Promise.all([
      this.getPath(source),
      this.getPath(destination)
    ]);

    const queryBuilder = this.createQueryBuilder()
      .update({
        path: this.getKnex().raw("? || subpath(path, nlevel(?) - 1)", [destinationPath, sourcePath])
      })
      .where("path <@ ?", [sourcePath]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.execute();
  }

  async removeDescendants(parent: NodeLike<Node>, qb?: QueryBuilderFunction<Node>): Promise<void> {
    const path = await this.getPath(parent);

    const queryBuilder = this.createQueryBuilder()
      .delete()
      .where("path != ?", [path])
      .andWhere("path <@ ?", [path]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.execute();
  }

  async removeSubtree(parent: NodeLike<Node>, qb?: QueryBuilderFunction<Node>): Promise<void> {
    const path = await this.getPath(parent);

    const queryBuilder = this.createQueryBuilder().delete().where("path <@ ?", [path]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.execute();
  }

  async streamSubtree(
    parent: NodeLike<Node>,
    qb?: QueryBuilderFunction<Node>
  ): Promise<AsyncIterable<Node>> {
    const path = await this.getPath(parent);

    const queryBuilder = this.createQueryBuilder().select("*").where("path <@ ?", [path]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.getKnexQuery().stream();
  }

  async updateAncestors(
    node: NodeLike<Node>,
    data: EntityData<Node>,
    qb?: QueryBuilderFunction<Node>
  ): Promise<void> {
    const path = await this.getPath(node);

    const queryBuilder = this.createQueryBuilder()
      .update(data)
      .where("path != ?", [path])
      .andWhere("path @> ?", [path]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.execute();
  }

  async updateDescendants(
    parent: NodeLike<Node>,
    data: EntityData<Node>,
    qb?: QueryBuilderFunction<Node>
  ): Promise<void> {
    const path = await this.getPath(parent);
    console.log(data);
    const queryBuilder = this.createQueryBuilder()
      .update(data)
      .where("path != ?", [path])
      .andWhere("path <@ ?", [path]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.execute();
  }

  async updateSubtree(
    parent: NodeLike<Node>,
    data: EntityData<Node>,
    qb?: QueryBuilderFunction<Node>
  ): Promise<void> {
    const path = await this.getPath(parent);

    const queryBuilder = this.createQueryBuilder().update(data).where("path <@ ?", [path]);

    if (qb) {
      await qb(queryBuilder);
    }

    return queryBuilder.execute();
  }

  private async getPath(nodeLike: NodeLike<Node>): Promise<string> {
    if (this.isNode(nodeLike)) {
      return nodeLike.path;
    }

    return nodeLike.toString();
  }

  private isNode(node: unknown): node is Node {
    return (
      typeof node === "object" &&
      typeof node !== null &&
      typeof (node as Node).id === "string" &&
      typeof (node as Node).path === "string"
    );
  }
}
