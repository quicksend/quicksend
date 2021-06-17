export interface Manager {
  createReadableStream(filename: string): NodeJS.ReadableStream | Promise<NodeJS.ReadableStream>;
  createWritableStream(filename: string): NodeJS.WritableStream | Promise<NodeJS.WritableStream>;

  rename(source: string, destination: string): void;
  unlink(path: string): void;
}
