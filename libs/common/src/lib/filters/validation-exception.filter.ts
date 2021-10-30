import { ArgumentsHost, BadRequestException, Catch, HttpStatus } from "@nestjs/common";

import { BaseExceptionFilter } from "@nestjs/core";
import { RpcException } from "@nestjs/microservices";

import { ValidationError } from "class-validator";

import { HttpException } from "../exceptions/http.exception";

import { InvalidArgumentRpcException } from "../exceptions/rpc/invalid-argument.exception";

export class ValidationException extends Error {
  constructor(readonly details: ValidationError[]) {
    super("Validation failed.");
  }
}

@Catch(ValidationException)
export class ValidationExceptionFilter extends BaseExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): void {
    const type = host.getType();

    switch (type) {
      case "http":
      case "ws":
        return this.handleHttpContext(exception, host);

      case "rpc":
        return this.handleRpcContext(exception, host);
    }
  }

  private handleHttpContext(exception: ValidationException, host: ArgumentsHost): void {
    return super.catch(
      new BadRequestException(
        new HttpException(
          HttpStatus.BAD_REQUEST,
          exception.message,
          exception.details.map((detail) => ({
            constraints: detail.constraints || {},
            property: detail.property
          }))
        )
      ),
      host
    );
  }

  private handleRpcContext(exception: ValidationException, host: ArgumentsHost): void {
    return super.catch(
      new RpcException(
        new InvalidArgumentRpcException(
          exception.message,
          exception.details.map((detail) => ({
            constraints: detail.constraints || {},
            property: detail.property
          }))
        )
      ),
      host
    );
  }
}
