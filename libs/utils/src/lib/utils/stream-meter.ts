import { PassThrough, TransformCallback } from "stream";

export class StreamMeter extends PassThrough {
  private _size = 0;

  get size(): number {
    return this._size;
  }

  limit(size: number, cb: () => void): this {
    if (this.size === size) {
      cb();
    }

    this.on(String(size), cb);

    return this;
  }

  _transform(
    chunk: Buffer,
    _encoding: string,
    callback: TransformCallback
  ): void {
    this._size += chunk.length;
    callback(null, chunk);
  }
}
