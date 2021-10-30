import { Injectable, OnModuleInit } from "@nestjs/common";

import { BaseManager } from "../base.manager";

import { S3ManagerOptions, s3ManagerOptionsSchema } from "./s3-manager-options.schema";

@Injectable()
export class S3Manager extends BaseManager implements OnModuleInit {
  private options!: S3ManagerOptions;

  async onModuleInit(): Promise<void> {
    this.options = await this.parseOptions(s3ManagerOptionsSchema);
  }

  createReadableStream(id: string): any {
    // TODO
  }

  createWritableStream(id: string): any {
    // TODO
  }

  removeFile(id: string): any {
    // TODO
  }
}
