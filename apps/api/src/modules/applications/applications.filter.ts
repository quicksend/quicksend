import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException
} from "@nestjs/common";

import {
  ApplicationConflictException,
  ApplicationException,
  CantFindApplicationException
} from "./application.exceptions";

@Catch(ApplicationException)
export class ApplicationsExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationException): void {
    switch (exception.constructor) {
      case ApplicationConflictException:
        throw new ConflictException(exception.message);

      case CantFindApplicationException:
        throw new NotFoundException(exception.message);

      default:
        throw exception;
    }
  }
}
