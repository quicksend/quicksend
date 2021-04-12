import {
  BadRequestException,
  ExecutionContext,
  HttpException,
  createParamDecorator
} from "@nestjs/common";

import { Request } from "express";

import { Maybe } from "../types/maybe.type";

export interface JSONHeaderOptions {
  exceptionFactory: (field?: string) => HttpException;
  field: string;
  optional: boolean;
}

export const DEFAULT_JSON_HEADER_OPTIONS: JSONHeaderOptions = {
  exceptionFactory: (field = DEFAULT_JSON_HEADER_OPTIONS.field) => {
    return new BadRequestException(`Header '${field}' must be JSON!`);
  },
  field: "Quicksend-API-Args",
  optional: false
};

export const JSONHeader = createParamDecorator(
  (options: Maybe<Partial<JSONHeaderOptions>>, ctx: ExecutionContext) => {
    const { exceptionFactory, field, optional } = {
      ...DEFAULT_JSON_HEADER_OPTIONS,
      ...options
    };

    const { headers } = ctx.switchToHttp().getRequest<Request>();

    const parse = <T extends Record<string, unknown>>(value: unknown): T => {
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
        return {};
      }

      throw error;
    }
  }
);
