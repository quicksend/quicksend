import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from "@nestjs/common";

import { Request, Response } from "express";

import { ThrottlerException } from "nestjs-throttler";

import { HttpExceptionResponseBody } from "../interfaces/http-exception-response-body.interface";

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(_exception: ThrottlerException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response<HttpExceptionResponseBody>>();

    const statusCode = HttpStatus.TOO_MANY_REQUESTS;

    res.status(statusCode).json({
      error: {
        message: "You are sending requests too quickly! Please slow down and try again later.", // prettier-ignore
        type: HttpStatus[statusCode]
      },
      path: req.url,
      timestamp: new Date().toISOString()
    });
  }
}
