import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";

import { HttpExceptionFilter } from "./http-exception.filter";

@Catch()
export class AllExceptionsFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }

    if (exception instanceof Error) {
      Logger.error(exception.message, exception.stack, exception.name);
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
}
