export interface IncomingFile {
  discriminator: string;
  encoding: string;
  filename: string;
  hash: string | null;
  mimetype: string;
  size: number;
}
