import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

import { Response } from "express";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface HttpExceptionResponseBody<T extends Record<string, unknown> = {}> {
  error: {
    code: string;
    message: string;
  } & T;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response<HttpExceptionResponseBody>>();

    const statusCode = exception.getStatus();

    res.status(statusCode).json({
      error: {
        code: HttpStatus[statusCode],
        message: exception.message
      }
    });
  }
}
