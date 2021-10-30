import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Folder {
  @Property()
  size: number;

  constructor(folder: Partial<Folder> = {}) {
    this.size = folder.size || 0;
  }
}
