import { BaseEntity } from "../base.entity";

export interface UploadSession extends BaseEntity {
  commitedAt?: number;
  expiresAt: number;
  owner: string;
}
