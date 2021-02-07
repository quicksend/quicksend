import { Readable } from "stream";

import { IncomingFile } from "./incoming-file.interface";
import { StorageEngine } from "./storage-engine.interface";

export type TransformerFactory = (file: IncomingFile) => Readable;

export interface MultiparterOptions {
  busboy: busboy.BusboyConfig;
  engine: StorageEngine;
  field: string;
  transformers: TransformerFactory[];
}
