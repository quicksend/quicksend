import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException
} from "@nestjs/common";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

import {
  AuthException,
  InvalidLoginCredentialsException,
  UserNotActivatedException
} from "./auth.exceptions";

@Catch(AuthException)
export class AuthExceptionFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(exception: AuthException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case InvalidLoginCredentialsException:
        return super.catch(new UnauthorizedException(exception), host);

      case UserNotActivatedException:
        return super.catch(new ForbiddenException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
