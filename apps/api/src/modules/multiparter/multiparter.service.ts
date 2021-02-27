import { Inject, Injectable } from "@nestjs/common";

import { IncomingMessage } from "http";
import { Readable } from "stream";

import { Multiparter, MultiparterOptions } from "@quicksend/multiparter";

import { MultiparterModuleOptions } from "./interfaces/multiparter-module-options.interface";

import { MULTIPARTER_MODULE_OPTIONS } from "./multiparter.constants";

@Injectable()
export class MultiparterService {
  constructor(
    @Inject(MULTIPARTER_MODULE_OPTIONS)
    private readonly multiparterOptions: MultiparterModuleOptions
  ) {}

  get engine() {
    return this.multiparterOptions.engine;
  }

  delete(filename: string): Promise<void> {
    return this.engine.delete(filename);
  }

  read(filename: string): Promise<Readable> | Readable {
    return this.engine.createReadable(filename);
  }

  write(
    req: IncomingMessage,
    localMultiparterOptions: Partial<MultiparterOptions> = {}
  ): Promise<Multiparter> {
    return new Multiparter({
      ...this.multiparterOptions,
      ...localMultiparterOptions
    }).parseAsync(req);
  }
}
