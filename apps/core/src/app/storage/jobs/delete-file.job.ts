import { FilterQuery } from "@mikro-orm/core";

import { File } from "../entities/file.entity";

export const DELETE_FILE = "DELETE_FILE";

export interface DeleteFileJob {
  file: FilterQuery<File>;
}
