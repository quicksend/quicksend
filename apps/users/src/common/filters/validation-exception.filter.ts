import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";

import { Observable } from "rxjs";
import { ValidationError } from "class-validator";

import { ValidationException as IValidationException } from "@quicksend/types";

export class ValidationException extends Error {
  constructor(readonly details: ValidationError[]) {
    super("Validation failed.");
  }
}

@Catch(ValidationException)
export class ValidationExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): Observable<unknown> {
    const error: IValidationException = {
      details: exception.details.map((detail) => ({
        constraints: detail.constraints || {},
        property: detail.property
      })),
      message: exception.message,
      timestamp: Date.now(),
      type: "VALIDATION_ERROR"
    };

    return super.catch(new RpcException(error), host);
  }
}
