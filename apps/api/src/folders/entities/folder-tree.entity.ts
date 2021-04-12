import { Entity, EntityRepositoryType, ManyToOne, Property } from "@mikro-orm/core";

import { Folder } from "./folder.entity";

import { ClosureTableRepository } from "../../common/repositories/closure-table.repository";

@Entity({
  customRepository: () =>
    ClosureTableRepository({
      ancestorColumn: "ancestor_id",
      depthColumn: "depth",
      descendantColumn: "descendant_id"
    })
})
export class FolderTree {
  [EntityRepositoryType]?: typeof ClosureTableRepository;

  @ManyToOne(() => Folder, {
    primary: true
  })
  ancestor!: Folder;

  @Property()
  depth!: number;

  @ManyToOne(() => Folder, {
    primary: true
  })
  descendant!: Folder;
}
