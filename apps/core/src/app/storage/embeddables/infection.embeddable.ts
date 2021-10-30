import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Infection {
  @Property()
  scannedAt: Date;

  @Property()
  threat: number;

  @Property()
  viruses: string[];

  constructor(infection: Partial<Infection> = {}) {
    this.scannedAt = infection.scannedAt || new Date();
    this.threat = infection.threat || 0;
    this.viruses = infection.viruses || [];
  }
}
