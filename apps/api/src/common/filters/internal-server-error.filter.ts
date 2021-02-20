import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";

import { Response } from "express";

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(InternalServerErrorException.name);

  catch(exception: InternalServerErrorException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const statusCode = exception.getStatus();

    this.logger.error(exception.message);

    res.status(statusCode).json({
      error: "Internal Server Error",
      message: "An error has occurred! Please try again later.",
      statusCode
    });
  }
}
