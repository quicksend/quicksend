import * as Busboy from "busboy";

import * as path from "path";

import { EventEmitter } from "events";
import { IncomingMessage } from "http";

import { FailedFile } from "./interfaces/failed-file.interface";
import { File } from "./interfaces/file.interface";
import { IncomingFile } from "./interfaces/incoming-file.interface";
import { MultiparterOptions } from "./interfaces/multiparter-options.interface";
import { SavedFile } from "./interfaces/saved-file.interface";

import {
  FileTooLarge,
  TooManyFields,
  TooManyFiles,
  TooManyParts,
  UnsupportedContentType
} from "./multiparter.exceptions";

import { Counter, HashCalculator, StreamMeter } from "@quicksend/utils";

import { generateId, pump, settlePromises } from "@quicksend/utils";

export class Multiparter extends EventEmitter {
  readonly duplicates: SavedFile[] = [];
  readonly failed: FailedFile[] = [];
  readonly files: IncomingFile[] = [];
  readonly succeeded: SavedFile[] = [];

  private _aborted = false;
  private _busboy: busboy.Busboy | null = null;
  private _finished = false;

  private readonly pendingWrites = new Counter();

  constructor(private readonly options: MultiparterOptions) {
    super();
  }

  get aborted() {
    return this._aborted;
  }

  get busboy() {
    return this._busboy;
  }

  get engine() {
    return this.options.engine;
  }

  get filter() {
    return this.options.filter || (async () => true);
  }

  get finished() {
    return this._finished;
  }

  abort(error: Error | null) {
    if (this._aborted) return;

    this._aborted = true;

    this.pendingWrites.whenItEqualsTo(0, () =>
      settlePromises(
        this.files
          .map((file) => () => this.engine.delete(file.discriminator))
          .map((fn) => fn())
      )
        .then(() => this.emit("aborted", error))
        .catch((err) => this.emit("aborted", err))
    );
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

      req.pipe(busboy); // Don't start piping until all event listeners are attached
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
    if (!this.finished && this.pendingWrites.is(0)) {
      this._finished = true;
      this.emit("finished");
    }
  }

  private async _handleFile(readable: NodeJS.ReadableStream, metadata: File) {
    try {
      const discriminator = await generateId(8);

      const incomingFile = Object.freeze({
        ...metadata,
        discriminator
      });

      const accept = await this.filter(metadata).catch((error: Error) => {
        this.failed.push({
          error: error.message,
          file: incomingFile
        });
      });

      if (!accept) return readable.resume();

      const hash = new HashCalculator("sha256");
      const meter = new StreamMeter();
      const writable = await this.engine.createWritable(discriminator);

      let fileTooLarge = false;

      readable
        .once("data", () => this.files.push(incomingFile))
        .once("limit", () => (fileTooLarge = true));

      this.pendingWrites.increment();

      await pump([
        readable,
        meter,
        ...(this.options.transformers || []).map((transform) =>
          transform(metadata)
        ),
        hash,
        writable
      ]);

      this.pendingWrites.decrement();

      if (fileTooLarge) {
        return this.failed.push({
          error: new FileTooLarge(incomingFile.filename).message,
          file: incomingFile
        });
      }

      const savedFile = Object.freeze({
        ...incomingFile,
        hash: hash.digest,
        size: meter.size
      });

      const isDuplicate = this.succeeded.find(
        (file) => file.hash === savedFile.hash
      );

      if (isDuplicate) {
        this.duplicates.push(savedFile);
      }

      this.succeeded.push(savedFile);
      this._finish();
    } catch (error) {
      this.pendingWrites.decrement();
      this.abort(error);
    }
  }

  private _renameWithIndex(filename: string, index: number) {
    if (index <= 0) return filename;

    const { ext, name } = path.posix.parse(filename);

    return path.posix.format({ ext, name: `${name} (${index})` });
  }
}
