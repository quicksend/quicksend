export class Lock {
  createdAt!: Date;

  createdBy!: string;

  expiresAt?: Date;

  reason?: string;
}
