import { FilterQuery } from "@mikro-orm/core";

import { Folder } from "../entities/folder.entity";

export interface RenameFolderPayload {
  folder: FilterQuery<Folder>;
  name: string;
  renameRoot?: boolean;
}
