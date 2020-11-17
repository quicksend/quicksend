import { Readable, Writable } from "stream";

export interface StorageEngine {
  createReadable(filename: string): Promise<Readable> | Readable;
  createWritable(filename: string): Promise<Writable> | Writable;
  delete(filename: string): Promise<void> | void;
}
