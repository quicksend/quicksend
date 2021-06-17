import {
  ArgumentsHost,
  Catch,
  HttpException,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";

import { HttpExceptionFilter } from "@quicksend/common";

@Catch()
export class AllExceptionFilter extends HttpExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }

    exception instanceof Error
      ? Logger.error(exception.message, exception.stack)
      : Logger.error(exception);

    return super.catch(
      new InternalServerErrorException("An error has occurred, please try again later!"),
      host
    );
  }
}
