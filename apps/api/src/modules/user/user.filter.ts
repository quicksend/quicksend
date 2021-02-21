import {
  Catch,
  ConflictException,
  ExceptionFilter,
  UnauthorizedException
} from "@nestjs/common";

import {
  EmailConflictException,
  IncorrectPasswordException,
  UserException,
  UsernameConflictException
} from "./user.exceptions";

@Catch(UserException)
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: UserException): void {
    switch (exception.constructor) {
      case EmailConflictException:
        throw new ConflictException(exception.message);

      case IncorrectPasswordException:
        throw new UnauthorizedException(exception.message);

      case UsernameConflictException:
        throw new ConflictException(exception.message);

      default:
        throw exception;
    }
  }
}
