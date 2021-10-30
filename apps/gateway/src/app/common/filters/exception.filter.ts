import { ArgumentsHost, Catch, HttpException, HttpStatus as HttpStatusCode } from "@nestjs/common";

import { BaseExceptionFilter } from "@nestjs/core";

import { Request } from "express";

import { RpcErrorCode, RpcException } from "@quicksend/common";

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const req = host.switchToHttp().getRequest<Request>();

    if (exception instanceof HttpException) {
      return super.catch(
        this.buildErrorResponse({
          code: exception.getStatus(),
          message: exception.message,
          path: req.path,
          status: HttpStatusCode[exception.getStatus()]
        }),
        host
      );
    }

    if (this.isRpcException(exception)) {
      return super.catch(
        this.buildErrorResponse({
          code: RpcException.getHttpStatusCode(exception.code),
          message: exception.message,
          path: req.path,
          status: exception.status
        }),
        host
      );
    }

    super.catch(
      this.buildErrorResponse({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error has occurred, please try again later!",
        path: req.path,
        status: HttpStatusCode[HttpStatusCode.INTERNAL_SERVER_ERROR]
      }),
      host
    );

    throw exception;
  }

  private buildErrorResponse(options: {
    code: HttpStatusCode;
    message: string;
    path: string;
    status: string;
  }): HttpException {
    return new HttpException(
      {
        error: {
          code: options.code,
          message: options.message,
          status: options.status
        },
        path: options.path,
        timestamp: new Date()
      },
      options.code
    );
  }

  private isObject(exception: unknown): exception is Record<string, unknown> {
    return typeof exception === "object" && exception !== null;
  }

  private isRpcException(exception: unknown): exception is RpcException {
    return (
      this.isObject(exception) &&
      typeof exception.code === "number" &&
      typeof exception.message === "string" &&
      Object.values(RpcErrorCode).includes(exception.code)
    );
  }
}
