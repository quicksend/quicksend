export interface LockItemPayload {
  expiresAt?: Date;
  item: string;
  lockedBy: string;
  reason?: string;
}
