import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { Readable, Writable } from "stream";

import { Promisable } from "type-fest";
import { ZodTypeAny } from "zod";

import { Config } from "../../common/config/config.schema";

@Injectable()
export abstract class BaseManager {
  constructor(private readonly configService: ConfigService<Config>) {}

  abstract createReadableStream(id: string): Promisable<Readable>;
  abstract createWritableStream(id: string): Promisable<Writable>;
  abstract removeFile(id: string): Promisable<void>;

  protected parseOptions<Schema extends ZodTypeAny>(
    schema: Schema,
    async?: true
  ): ReturnType<typeof schema.parseAsync>;
  protected parseOptions<Schema extends ZodTypeAny>(
    schema: Schema,
    async?: false
  ): ReturnType<typeof schema.parse>;
  protected parseOptions<Schema extends ZodTypeAny>(
    schema: Schema,
    async = true
  ): ReturnType<typeof schema.parseAsync> | ReturnType<typeof schema.parse> {
    const options = this.configService.get("storage")?.manager.options;

    return async ? schema.parseAsync(options) : schema.parse(options);
  }

  protected safeParseOptions<Schema extends ZodTypeAny>(
    schema: Schema,
    async?: true
  ): ReturnType<typeof schema.safeParseAsync>;
  protected safeParseOptions<Schema extends ZodTypeAny>(
    schema: Schema,
    async?: false
  ): ReturnType<typeof schema.safeParse>;
  protected safeParseOptions<Schema extends ZodTypeAny>(
    schema: Schema,
    async = true
  ): ReturnType<typeof schema.safeParseAsync> | ReturnType<typeof schema.safeParse> {
    const options = this.configService.get("storage")?.manager.options;

    return async ? schema.safeParseAsync(options) : schema.safeParse(options);
  }
}
