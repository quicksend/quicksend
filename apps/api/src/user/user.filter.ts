import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  UnauthorizedException
} from "@nestjs/common";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

import {
  EmailConflictException,
  IncorrectPasswordException,
  InvalidActivationTokenException,
  InvalidEmailConfirmationTokenException,
  InvalidPasswordResetTokenException,
  UserException,
  UsernameConflictException
} from "./user.exceptions";

@Catch(UserException)
export class UserExceptionFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(exception: UserException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case EmailConflictException:
      case UsernameConflictException:
        return super.catch(new ConflictException(exception), host);

      case IncorrectPasswordException:
        return super.catch(new UnauthorizedException(exception), host);

      case InvalidActivationTokenException:
      case InvalidEmailConfirmationTokenException:
      case InvalidPasswordResetTokenException:
        return super.catch(new BadRequestException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
