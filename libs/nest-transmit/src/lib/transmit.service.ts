import { Inject, Injectable } from "@nestjs/common";

import { IncomingMessage } from "http";

import {
  IncomingFile,
  ParseAsyncResults,
  Transmit,
  TransmitOptions,
  TRANSMIT_DEFAULT_OPTIONS
} from "@quicksend/transmit";

import { TRANSMIT_MODULE_OPTIONS } from "./transmit.constants";

import { TransmitModuleOptions } from "./transmit.interfaces";

@Injectable()
export class TransmitService {
  private readonly transmitModuleOptions: TransmitOptions;

  constructor(
    @Inject(TRANSMIT_MODULE_OPTIONS)
    transmitModuleOptions: TransmitModuleOptions
  ) {
    this.transmitModuleOptions = {
      ...TRANSMIT_DEFAULT_OPTIONS,
      ...transmitModuleOptions
    };
  }

  get manager() {
    return this.transmitModuleOptions.manager;
  }

  delete(file: IncomingFile): Promise<void> {
    return this.manager.deleteFile(file);
  }

  parse(
    req: IncomingMessage,
    localTransmitOptions: Partial<TransmitOptions> = {}
  ): Promise<ParseAsyncResults> {
    return new Transmit({
      ...this.transmitModuleOptions,
      ...localTransmitOptions
    }).parseAsync(req);
  }
}
