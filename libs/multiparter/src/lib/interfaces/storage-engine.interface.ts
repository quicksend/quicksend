import { Readable, Writable } from "stream";

export interface StorageEngine {
  createReadable(filename: string): Promise<Readable>;
  createWritable(filename: string): Promise<Writable>;
  delete(filename: string): Promise<void>;
}
