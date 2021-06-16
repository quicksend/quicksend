import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";

import { ValidationException } from "@quicksend/types";

import { HttpExceptionFilter } from "./http-exception.filter";

@Catch()
export class AllExceptionsFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }

    if (this.isValidationError(exception)) {
      return super.catch(new BadRequestException(exception), host);
    }

    if (exception instanceof Error) {
      Logger.error(exception.message, exception.stack);
    } else {
      Logger.error(exception);
    }

    return super.catch(
      new InternalServerErrorException(
        "The server was unable to fulfill your request. Please try again later."
      ),
      host
    );
  }

  private isValidationError(exception: unknown): exception is ValidationException {
    return (
      typeof exception === "object" &&
      (exception as ValidationException).type === "VALIDATION_ERROR"
    );
  }
}
