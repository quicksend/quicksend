import * as Busboy from "busboy";

import * as path from "path";

import { EventEmitter } from "events";
import { IncomingMessage } from "http";
import { Readable } from "stream";

import { FailedFile } from "./interfaces/failed-file.interface";
import { IncomingFile } from "./interfaces/incoming-file.interface";
import { MultiparterOptions } from "./interfaces/multiparter-options.interface";

import {
  FileTooLarge,
  TooManyFields,
  TooManyFiles,
  TooManyParts,
  UnsupportedContentType
} from "./multiparter.exceptions";

import { Counter, HashCalculator, StreamMeter } from "@quicksend/utils";

import { generateId, pump, settlePromises } from "@quicksend/utils";

export type TransformerGenerator = (file: IncomingFile) => Readable;

export class Multiparter extends EventEmitter {
  readonly failed: FailedFile[] = [];
  readonly files: IncomingFile[] = [];
  readonly succeeded: IncomingFile[] = [];

  private _aborted = false;
  private _busboy: busboy.Busboy | null = null;
  private _finished = false;

  private readonly _transformers: TransformerGenerator[] = [];
  private readonly _pendingWrites = new Counter();

  constructor(private readonly options: MultiparterOptions) {
    super();
  }

  get aborted() {
    return this._aborted;
  }

  get busboy() {
    return this._busboy;
  }

  get finished() {
    return this._finished;
  }

  get pendingWrites() {
    return this._pendingWrites.value;
  }

  get storageEngine() {
    return this.options.engine;
  }

  abort(error: Error | null) {
    if (this._aborted) return;

    this._aborted = true;

    this._pendingWrites.whenItEqualsTo(0, () =>
      settlePromises(
        this.files
          .map((file) => () => this.storageEngine.delete(file.discriminator))
          .map((fn) => fn())
      )
        .then(() => this.emit("aborted", error))
        .catch((err) => this.emit("aborted", err))
    );
  }

  addTransformer(transformer: TransformerGenerator): this {
    this._transformers.push(transformer);

    return this;
  }

  parse(req: IncomingMessage) {
    const busboy = this._createBusboy({
      ...this.options.busboy,
      headers: req.headers
    });

    const filenames: string[] = [];

    busboy
      .on("error", (error: Error) => this.abort(error))
      .on("fieldsLimit", () => this.abort(new TooManyFields()))
      .on("file", (field, readable, filename, encoding, mimetype) => {
        if (this.aborted || this.finished) {
          return readable.resume();
        }

        if (!filename || field !== this.options.field) {
          return readable.resume();
        }

        filename = this._renameWithIndex(
          filename,
          filenames.filter((name) => name === filename).length
        );

        filenames.push(filename);

        this._handleFile(readable, {
          encoding,
          filename,
          mimetype
        });
      })
      .on("filesLimit", () => this.abort(new TooManyFiles()))
      .on("finish", () => this._finish())
      .on("partsLimit", () => this.abort(new TooManyParts()));

    req.on("aborted", () => {
      busboy.end();
      this.abort(null);
    });

    this._busboy = busboy;

    return new Promise<this>((resolve, reject) => {
      this.on("aborted", (error: Error | null) => {
        if (error) reject(error);
        else resolve(this);
      });

      this.on("finished", () => {
        resolve(this);
      });

      req.pipe(busboy);
    });
  }

  private _createBusboy(options: busboy.BusboyConfig) {
    try {
      return new Busboy(options);
    } catch (error) {
      throw new UnsupportedContentType();
    }
  }

  private _finish() {
    if (!this._finished && this._pendingWrites.is(0)) {
      this._finished = true;
      this.emit("finished");
    }
  }

  private async _handleFile(
    readable: NodeJS.ReadableStream,
    metadata: {
      encoding: string;
      filename: string;
      mimetype: string;
    }
  ) {
    try {
      const discriminator = await generateId(8);

      const filter = this.options.filter || (async () => true);

      const incomingFile: IncomingFile = {
        ...metadata,
        discriminator,
        hash: null,
        size: 0
      };

      const accept = await filter(incomingFile).catch((error: Error) => {
        this.failed.push({
          error,
          file: incomingFile
        });
      });

      if (!accept) return readable.resume();

      const hash = new HashCalculator("sha256");
      const meter = new StreamMeter();
      const writable = await this.storageEngine.createWritable(discriminator);

      let fileTooLarge = false;

      meter.on("data", () => (incomingFile.size += meter.size));

      readable
        .once("data", () => this.files.push(incomingFile))
        .once("limit", () => (fileTooLarge = true));

      this._pendingWrites.increment();

      await pump([
        readable,
        meter,
        ...this._transformers.map((transform) => transform(incomingFile)),
        hash,
        writable
      ]);

      this._pendingWrites.decrement();

      incomingFile.hash = hash.digest;

      if (fileTooLarge) {
        this.failed.push({
          error: new FileTooLarge(incomingFile.filename),
          file: incomingFile
        });
      } else {
        this.succeeded.push(incomingFile);
        this._finish();
      }
    } catch (error) {
      this._pendingWrites.decrement();
      this.abort(error);
    }
  }

  private _renameWithIndex(filename: string, index: number) {
    if (index <= 0) return filename;

    const { ext, name } = path.posix.parse(filename);

    return path.posix.format({ ext, name: `${name} (${index})` });
  }
}
