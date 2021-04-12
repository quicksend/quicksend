import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ValidationError } from "class-validator";

import { HttpExceptionResponseBody } from "../interfaces/http-exception-response-body.interface";
import { ValidationExceptionResponsePayload } from "../interfaces/validation-exception-response-payload.interface";

export type ValidationExceptionResponseBody = HttpExceptionResponseBody<ValidationExceptionResponsePayload>;

// Wrapper class used in exception factory for validation pipe
export class ValidationException extends Error {
  constructor(readonly details: ValidationError[]) {
    super("Validation failed.");
  }
}

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response<ValidationExceptionResponseBody>>();

    res.status(HttpStatus.BAD_REQUEST).json({
      error: {
        code: "VALIDATION_ERROR",
        details: exception.details.map((detail) => ({
          children: detail.children || [],
          constraints: detail.constraints || {},
          property: detail.property
        })),
        message: exception.message
      }
    });
  }
}
