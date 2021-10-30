import { Capabilities } from "./capabilities.resource";
import { File } from "./file.resource";
import { Folder } from "./folder.resource";
import { Lock } from "./lock.resource";
import { Trash } from "./trash.resource";

export class Item {
  capabilities!: Capabilities;

  createdAt!: Date;

  createdBy!: string;

  expiresAt?: Date;

  file?: File;

  folder?: Folder;

  id!: string;

  lock?: Lock;

  name!: string;

  parent?: string;

  trash?: Trash;
}
