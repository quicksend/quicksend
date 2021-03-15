import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

import {
  ApplicationConflictException,
  ApplicationsException,
  CantFindApplicationException
} from "./applications.exceptions";

@Catch(ApplicationsException)
export class ApplicationsExceptionFilter
  extends HttpExceptionFilter
  implements ExceptionFilter {
  catch(exception: ApplicationsException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case ApplicationConflictException:
        return super.catch(new ConflictException(exception), host);

      case CantFindApplicationException:
        return super.catch(new NotFoundException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
