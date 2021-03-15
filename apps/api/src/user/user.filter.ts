import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

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
export class UserExceptionFilter
  extends HttpExceptionFilter
  implements ExceptionFilter {
  catch(exception: UserException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case CantFindUserException:
        return super.catch(new NotFoundException(exception), host);

      case EmailConflictException:
        return super.catch(new ConflictException(exception), host);

      case IncorrectPasswordException:
        return super.catch(new UnauthorizedException(exception), host);

      case InvalidEmailConfirmationTokenException:
        return super.catch(new BadRequestException(exception), host);

      case InvalidPasswordResetTokenException:
        return super.catch(new BadRequestException(exception), host);

      case UsernameConflictException:
        return super.catch(new ConflictException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
