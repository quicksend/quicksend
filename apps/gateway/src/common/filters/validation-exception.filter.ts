import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";

import { Response } from "express";
import { ValidationError } from "class-validator";

import { HttpExceptionResponseBody } from "./http-exception.filter";

export type ValidationExceptionResponseBody = HttpExceptionResponseBody<{
  details: Array<{
    children: ValidationError[];
    constraints: Record<string, unknown>;
    property: string;
  }>;
}>;

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
