export interface ItemModel {
  createdAt: Date;
  deletedAt: Date | null;
  discriminator: string;
  hash: string;
  id: string;
  size: number;
}
