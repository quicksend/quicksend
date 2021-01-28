import {
  BadRequestException,
  ExecutionContext,
  HttpException,
  createParamDecorator
} from "@nestjs/common";

import { Request } from "express";

import { config } from "@quicksend/config";

export const DEFAULT_FIELD = `${config.get("branding")}-API-Args`;

export const DEFAULT_EXCEPTION_FACTORY = () => {
  return new BadRequestException(`Header '${DEFAULT_FIELD}' must be a JSON!`);
};

export interface JSONHeaderOptions {
  exceptionFactory?: (field: string) => HttpException;
  field?: string;
  optional?: boolean;
}

export const JSONHeader = createParamDecorator(
  (options: JSONHeaderOptions | undefined, ctx: ExecutionContext) => {
    const { headers } = ctx.switchToHttp().getRequest<Request>();

    const {
      exceptionFactory = DEFAULT_EXCEPTION_FACTORY,
      field = DEFAULT_FIELD,
      optional = false
    } = options || {};

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
      if (!optional) {
        // don't throw JSON syntax errors
        return {};
      }

      throw error;
    }
  }
);
