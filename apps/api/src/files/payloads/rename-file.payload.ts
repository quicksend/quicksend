import { FilterQuery } from "@mikro-orm/core";

import { User } from "../../user/entities/user.entity";
import { VirtualFile } from "../entities/virtual-file.entity";

export interface RenameFilePayload {
  file: FilterQuery<VirtualFile>;
  name: string;
  user: User;
}
