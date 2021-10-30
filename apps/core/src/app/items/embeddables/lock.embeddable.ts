import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Lock {
  @Property()
  createdAt: Date;

  @Property()
  createdBy: string;

  @Property({
    nullable: true
  })
  expiresAt?: Date;

  @Property({
    length: 255,
    nullable: true
  })
  reason?: string;

  // prettier-ignore
  constructor(lock: {
    createdAt?: Date;
    createdBy: string;
    expiresAt?: Date;
    reason?: string;
  }) {
    this.createdAt = lock.createdAt || new Date();
    this.createdBy = lock.createdBy;
    this.expiresAt = lock.expiresAt;
    this.reason = lock.reason;
  }
}
