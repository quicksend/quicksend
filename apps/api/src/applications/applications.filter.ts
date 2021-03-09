import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException
} from "@nestjs/common";

import {
  ApplicationConflictException,
  ApplicationsException,
  CantFindApplicationException
} from "./applications.exceptions";

@Catch(ApplicationsException)
export class ApplicationsExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationsException): void {
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
