import { Capabilities } from "./capabilities.resource";
import { Folder } from "./folder.resource";
import { Lock } from "./lock.resource";
import { Trash } from "./trash.resource";

export class Snapshot {
  capabilities!: Capabilities;

  createdAt!: Date;

  createdBy!: string;

  expiresAt?: Date;

  file?: string;

  folder?: Folder;

  lock?: Lock;

  name!: string;

  parent?: string;

  trash?: Trash;
}
