import { IncomingFile } from "./incoming-file.interface";
import { StorageEngine } from "./storage-engine.interface";

export type TransformerFactory = (file: IncomingFile) => NodeJS.ReadWriteStream;

export interface MultiparterOptions {
  busboy: busboy.BusboyConfig;
  engine: StorageEngine;
  field: string;
  transformers: TransformerFactory[];
}
