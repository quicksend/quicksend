import fs from "fs";

import { Manager } from "../interfaces/manager.interface";

export class DiskManager implements Manager {
  createReadableStream(filename: string): NodeJS.ReadableStream {
    return fs.createReadStream(filename);
  }

  createWritableStream(filename: string): NodeJS.WritableStream {
    return fs.createWriteStream(filename);
  }

  rename(source: string, destination: string): Promise<void> {
    return fs.promises.rename(source, destination);
  }

  unlink(source: string): Promise<void> {
    return fs.promises.unlink(source);
  }
}
