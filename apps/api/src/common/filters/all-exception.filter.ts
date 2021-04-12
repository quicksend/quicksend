import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException
} from "@nestjs/common";

import { HttpExceptionFilter } from "./http-exception.filter";

@Catch()
export class AllExceptionsFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }

    return super.catch(new InternalServerErrorException(exception), host);
  }
}
