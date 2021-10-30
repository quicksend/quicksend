export interface CreateFolderPayload {
  createdBy: string;
  expiresAt?: Date;
  name: string;
  parent: string;
}
