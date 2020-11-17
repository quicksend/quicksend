export interface ItemModel {
  createdAt: Date;
  deletedAt: Date;
  discriminator: string;
  hash: string;
  id: string;
  size: number;
}
