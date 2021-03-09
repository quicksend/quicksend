import {
  Catch,
  ExceptionFilter,
  ForbiddenException,
  UnauthorizedException
} from "@nestjs/common";

import {
  AuthenticationException,
  InvalidLoginCredentialsException,
  UserNotActivatedException
} from "./auth.exceptions";

@Catch(AuthenticationException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: AuthenticationException): void {
    switch (exception.constructor) {
      case InvalidLoginCredentialsException:
        throw new UnauthorizedException(exception.message);

      case UserNotActivatedException:
        throw new ForbiddenException(exception.message);

      default:
        throw exception;
    }
  }
}
