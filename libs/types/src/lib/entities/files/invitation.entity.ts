import { BaseEntity } from "../base.entity";

import { File } from "./file.entity";

export interface Invitation extends BaseEntity {
  expiresAt?: number;
  file: File;
  invitee?: string;
  inviter: string;
  path: string;
  privileges: number;
}
