import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";

import { Observable } from "rxjs";
import { ValidationError } from "class-validator";

import { HttpExceptionResponseBody } from "./http-exception.filter";
import { RpcExceptionResponseBody } from "./rpc-exception.filter";

export class ValidationException extends Error {
  constructor(readonly details: ValidationError[]) {
    super("Validation failed.");
  }
}

export type ValidationHttpExceptionResponseBody = HttpExceptionResponseBody<{
  details: Array<{
    constraints: Record<string, string>;
    property: string;
  }>;
}>;

@Catch(ValidationException)
export class ValidationHttpExceptionFilter extends BaseExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): void {
    const req = host.switchToHttp().getRequest<Request>();

    const error: ValidationHttpExceptionResponseBody = {
      error: {
        code: "VALIDATION_ERROR",
        details: exception.details.map((detail) => ({
          constraints: detail.constraints || {},
          property: detail.property
        })),
        message: exception.message
      },
      path: req.url,
      timestamp: Date.now()
    };

    return super.catch(new BadRequestException(error), host);
  }
}

export type ValidationRpcExceptionResponseBody = RpcExceptionResponseBody<{
  details: Array<{
    constraints: Record<string, string>;
    property: string;
  }>;
}>;

@Catch(ValidationException)
export class ValidationRpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): Observable<unknown> {
    const error: ValidationRpcExceptionResponseBody = {
      error: {
        code: "VALIDATION_ERROR",
        details: exception.details.map((detail) => ({
          constraints: detail.constraints || {},
          property: detail.property
        })),
        message: exception.message
      },
      timestamp: Date.now()
    };

    return super.catch(new RpcException(error), host);
  }
}
