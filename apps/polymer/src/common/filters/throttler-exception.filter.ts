import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { ThrottlerException } from "nestjs-throttler";

import { HttpExceptionFilter } from "./http-exception.filter";

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(_exception: ThrottlerException, host: ArgumentsHost): void {
    return super.catch(
      new HttpException(
        "You are sending requests too quickly! Please slow down and try again later.",
        HttpStatus.TOO_MANY_REQUESTS
      ),
      host
    );
  }
}
