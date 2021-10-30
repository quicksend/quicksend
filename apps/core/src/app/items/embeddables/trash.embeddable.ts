import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Trash {
  @Property()
  createdAt: Date;

  @Property()
  createdBy: string;

  // prettier-ignore
  constructor(metadata: {
    createdAt?: Date;
    createdBy: string
  }) {
    this.createdAt = metadata.createdAt || new Date();
    this.createdBy = metadata.createdBy;
  }
}
