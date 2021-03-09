import {
  BadRequestException,
  ExecutionContext,
  HttpException,
  createParamDecorator
} from "@nestjs/common";

import { Request } from "express";

export interface JSONHeaderOptions {
  exceptionFactory: (field?: string) => HttpException;
  field: string;
  optional: boolean;
}

export const DEFAULT_JSON_HEADER_OPTIONS: JSONHeaderOptions = {
  exceptionFactory: (field?: string) => {
    return new BadRequestException(
      `Header '${field || DEFAULT_JSON_HEADER_OPTIONS.field}' must be JSON!`
    );
  },
  field: "Quicksend-API-Args",
  optional: false
};

export const JSONHeader = createParamDecorator(
  (options: Partial<JSONHeaderOptions> | undefined, ctx: ExecutionContext) => {
    const { headers } = ctx.switchToHttp().getRequest<Request>();

    const { exceptionFactory, field, optional } = {
      ...DEFAULT_JSON_HEADER_OPTIONS,
      ...options
    };

    const parse = (value: unknown) => {
      if (typeof value !== "string") {
        throw exceptionFactory(field);
      }

      try {
        return JSON.parse(value);
      } catch {
        throw exceptionFactory(field);
      }
    };

    try {
      return parse(headers[field.toLowerCase()]);
    } catch (error) {
      if (optional) {
        // don't throw JSON syntax errors
        return {};
      }

      throw error;
    }
  }
);
