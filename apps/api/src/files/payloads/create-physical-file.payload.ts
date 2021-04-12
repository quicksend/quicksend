export interface CreatePhysicalFilePayload {
  discriminator: string;
  hash: string;
  size: number;
}
