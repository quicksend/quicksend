export interface TransmitManager {
  createReadable(filename: string): Promise<NodeJS.ReadableStream>;
  createWritable(filename: string): Promise<NodeJS.WritableStream>;
  delete(filename: string): Promise<void>;
}
