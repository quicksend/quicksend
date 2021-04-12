import { FilterQuery } from "@mikro-orm/core";

import { Folder } from "../entities/folder.entity";
import { User } from "../../user/entities/user.entity";

export interface CreateFolderPayload {
  name: string;
  parent?: FilterQuery<Folder>;
  user: User;
}
