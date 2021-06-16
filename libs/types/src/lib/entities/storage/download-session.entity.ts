import { BaseEntity } from "../base.entity";

export interface DownloadSession extends BaseEntity {
  expiresAt: number;
  hash: string;
  owner: string;
}
