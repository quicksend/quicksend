import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";

import { Response } from "express";

import { HttpExceptionResponseBody } from "../interfaces/http-exception-response-body.interface";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response<HttpExceptionResponseBody>>();

    const statusCode = exception.getStatus();

    if (statusCode >= 500) {
      Logger.error(exception.message, exception.stack, exception.name);

      res.status(statusCode).json({
        error: {
          code: HttpStatus[statusCode],
          message: "The server was unable to fulfill your request. Please try again later."
        }
      });
    } else {
      res.status(statusCode).json({
        error: {
          code: HttpStatus[statusCode],
          message: exception.message
        }
      });
    }
  }
}
