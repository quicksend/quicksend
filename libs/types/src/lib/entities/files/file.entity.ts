import { BaseEntity } from "../base.entity";

export interface File extends BaseEntity {
  capabilities: number;
  hash?: string;
  name: string;
  owner: string;
  parent?: string;
  size: number;
}
