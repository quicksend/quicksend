import {
  BadRequestException,
  ExecutionContext,
  HttpException,
  createParamDecorator
} from "@nestjs/common";

import { Request } from "express";

import { ValidationPipe } from "../pipes/validation.pipe";

import { Maybe } from "../types/maybe.type";

export interface JSONHeaderOptions {
  exceptionFactory: (field: string) => HttpException;
  field: string;
  optional: boolean;
}

export const DEFAULT_JSON_HEADER_OPTIONS: JSONHeaderOptions = {
  exceptionFactory: (field) => new BadRequestException(`Header '${field}' must be JSON!`),
  field: "Quicksend-API-Args",
  optional: false
};

export const JSONHeaderParamDecorator = createParamDecorator(
  (options: Maybe<Partial<JSONHeaderOptions>>, ctx: ExecutionContext) => {
    const { exceptionFactory, field, optional } = {
      ...DEFAULT_JSON_HEADER_OPTIONS,
      ...options
    };

    const { headers } = ctx.switchToHttp().getRequest<Request>();

    const parse = (value: unknown): Record<string, unknown> => {
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

export const JSONHeader = (options?: Partial<JSONHeaderOptions>): ParameterDecorator => {
  return JSONHeaderParamDecorator(
    options,
    ValidationPipe({
      validateCustomDecorators: true
    })
  );
};
