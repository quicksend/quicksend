import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";

import { Request, Response } from "express";

import { HttpExceptionResponseBody } from "../interfaces/http-exception-response-body.interface";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response<HttpExceptionResponseBody>>();

    const statusCode = exception.getStatus();

    res.status(statusCode).json({
      error: {
        message: exception.message,
        type: HttpStatus[statusCode]
      },
      path: req.url,
      timestamp: new Date().toISOString()
    });
  }
}
