import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from "@nestjs/common";

import { Request, Response } from "express";

import { ValidationError } from "class-validator";

import { ValidationExceptionResponseBody } from "../interfaces/validation-exception-response-body.interface";

// Wrapper class used in exception factory for validation pipe
export class ValidationException {
  static readonly TYPE = "VALIDATION_ERROR";

  constructor(readonly details: ValidationError[]) {}
}

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response<ValidationExceptionResponseBody>>();

    res.status(HttpStatus.BAD_REQUEST).json({
      error: {
        details: exception.details.map((detail) => ({
          constraints: detail.constraints || {},
          property: detail.property
        })),
        type: ValidationException.TYPE
      },
      path: req.url,
      timestamp: new Date().toISOString()
    });
  }
}
