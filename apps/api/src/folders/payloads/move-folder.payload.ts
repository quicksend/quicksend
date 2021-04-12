import { FilterQuery } from "@mikro-orm/core";

import { Folder } from "../entities/folder.entity";

export interface MoveFolderPayload {
  destination: FilterQuery<Folder>;
  moveRoot?: boolean;
  source: FilterQuery<Folder>;
}
