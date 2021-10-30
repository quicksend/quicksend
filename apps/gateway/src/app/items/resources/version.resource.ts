import { Item } from "./item.resource";
import { Snapshot } from "./snapshot.resource";

export class Version {
  createdAt!: Date;

  createdBy!: string;

  expiresAt?: Date;

  item!: Item;

  id!: string;

  name?: string;

  snapshot!: Snapshot;
}
