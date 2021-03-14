import {
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";

import {
  CantFindUserException,
  EmailConflictException,
  IncorrectPasswordException,
  InvalidEmailConfirmationTokenException,
  InvalidPasswordResetTokenException,
  UserException,
  UsernameConflictException
} from "./user.exceptions";

@Catch(UserException)
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: UserException): void {
    switch (exception.constructor) {
      case CantFindUserException:
        throw new NotFoundException(exception.message);

      case EmailConflictException:
        throw new ConflictException(exception.message);

      case IncorrectPasswordException:
        throw new UnauthorizedException(exception.message);

      case InvalidEmailConfirmationTokenException:
        throw new BadRequestException(exception.message);

      case InvalidPasswordResetTokenException:
        throw new BadRequestException(exception.message);

      case UsernameConflictException:
        throw new ConflictException(exception.message);

      default:
        throw exception;
    }
  }
}
