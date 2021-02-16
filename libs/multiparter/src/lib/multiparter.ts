import * as Busboy from "busboy";

import { EventEmitter } from "events";
import { IncomingMessage } from "http";

import { Counter, HashCalculator, StreamMeter } from "@quicksend/utils";
import { generateId, pump, settlePromises } from "@quicksend/utils";

import { MultiparterException } from "./multiparter.exceptions";

import { BusboyReadable } from "./interfaces/busboy-readable.interface";
import { FailedFile } from "./interfaces/failed-file.interface";
import { FilterFunction } from "./interfaces/filter-function.interface";
import { IncomingFile } from "./interfaces/incoming-file.interface";
import { MultiparterOptions } from "./interfaces/multiparter-options.interface";
import { WrittenFile } from "./interfaces/written-file.interface";

export class Multiparter extends EventEmitter {
  private readonly _failed: FailedFile[] = [];
  private readonly _incoming: IncomingFile[] = [];
  private readonly _written: WrittenFile[] = [];

  private readonly _pendingWrites = new Counter();

  private _aborted = false;
  private _busboyFinished = false;
  private _finished = false;

  constructor(private readonly options: MultiparterOptions) {
    super();
  }

  get aborted() {
    return this._aborted;
  }

  get failed() {
    return this._failed;
  }

  get finished() {
    return this._finished;
  }

  get incoming() {
    return this._incoming;
  }

  get pendingWrites() {
    return this._pendingWrites.value;
  }

  get written() {
    return this._written;
  }

  abort(error?: Error): void {
    if (this._aborted) return;

    this._aborted = true;
    this._pendingWrites.whenItEqualsTo(0, () => this.emit("aborted", error));
  }

  async cleanUp(): Promise<void> {
    await settlePromises(
      this._incoming
        .map((file) => () => this.options.engine.delete(file.discriminator))
        .map((fn) => fn())
    );
  }

  parse(req: IncomingMessage, filter?: FilterFunction): busboy.Busboy {
    const busboy = this._createBusboy({
      ...this.options.busboy,
      headers: req.headers
    });

    busboy.on("file", async (field, readable, filename, encoding, mimetype) => {
      if (this.aborted || this.finished) {
        return readable.resume();
      }

      if (field !== this.options.field) {
        return readable.resume();
      }

      const discriminator = await generateId(8);

      const incomingFile = {
        discriminator,
        encoding,
        field,
        mimetype,
        // filename could be an empty string, so we fall back to the discriminator as a filename
        name: filename || discriminator
      };

      if (filter && !(await filter(incomingFile))) {
        return readable.resume();
      }

      // Create PR and add truncated property to readable stream
      // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/busboy/index.d.ts#L41
      await this._handleFile(incomingFile, readable as BusboyReadable);

      this._finish();
    });

    req.on("aborted", () => {
      busboy.end();
      this.abort();
    });

    req.pipe(busboy);

    return busboy;
  }

  parseAsync(req: IncomingMessage, filter?: FilterFunction): Promise<this> {
    return new Promise((resolve, reject) => {
      this.parse(req, filter);

      this.once("aborted", (error?: Error) => {
        this.cleanUp()
          .then(() => (error ? reject(error) : resolve(this)))
          .catch((err) => reject(err));
      });

      this.once("finished", () => resolve(this));
    });
  }

  private _createBusboy(options: busboy.BusboyConfig) {
    try {
      return new Busboy(options)
        .on("error", (error: Error) => this.abort(error))
        .on("fieldsLimit", () =>
          this.abort(new MultiparterException("TOO_MANY_FIELDS"))
        )
        .on("filesLimit", () =>
          this.abort(new MultiparterException("TOO_MANY_FILES"))
        )
        .on("partsLimit", () =>
          this.abort(new MultiparterException("TOO_MANY_PARTS"))
        )
        .on("finish", () => {
          this._busboyFinished = true;
          this._finish();
        });
    } catch (error) {
      throw new MultiparterException("UNSUPPORTED_CONTENT_TYPE");
    }
  }

  private _finish() {
    if (
      !this._aborted &&
      !this._finished &&
      this._busboyFinished &&
      this._pendingWrites.is(0)
    ) {
      this._finished = true;
      this.emit("finished");
    }
  }

  private async _handleFile(file: IncomingFile, readable: BusboyReadable) {
    const hash = new HashCalculator("sha256");
    const meter = new StreamMeter();

    const writable = await this.options.engine.createWritable(
      file.discriminator
    );

    this._incoming.push(file);

    try {
      this._pendingWrites.increment();

      // TODO: maybe use pipeline instead
      await pump([
        readable,
        meter,
        ...this.options.transformers.map((transform) => transform(file)),
        hash,
        writable
      ]);

      this._pendingWrites.decrement();

      if (readable.truncated) {
        this._failed.push({
          file,
          reason: new MultiparterException("FILE_TOO_LARGE")
        });
      } else {
        this._written.push({
          ...file,
          hash: hash.digest,
          size: meter.size
        });
      }
    } catch (error) {
      this._pendingWrites.decrement();

      this.abort(error);
    }
  }
}
