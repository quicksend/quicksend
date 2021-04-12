import { TransmitManager } from "@quicksend/transmit";

export interface Manager extends TransmitManager {
  createReadableStream(filename: string): Promise<NodeJS.ReadableStream>;
  deleteByFilename(filename: string): Promise<void>;
}
