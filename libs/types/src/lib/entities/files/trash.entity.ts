import { BaseEntity } from "../base.entity";

import { File } from "./file.entity";

export interface Trash extends BaseEntity {
  file: File;
  originalParent?: File;
  owner: string;
}
