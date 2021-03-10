export interface StorageEngine {
  createReadableStream(filename: string): Promise<NodeJS.ReadableStream>;
  deleteFile(filename: string): Promise<void>;
}
