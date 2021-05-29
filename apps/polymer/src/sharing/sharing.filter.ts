import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

import {
  InsufficientPrivilegesException,
  InvitationConflictException,
  InvitationNotFoundException,
  InviteeCannotBeOwnerException,
  InviteeCannotBeSelfException,
  InviteeNotFoundException,
  SharingException
} from "./sharing.exceptions";

@Catch(SharingException)
export class SharingExceptionFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(exception: SharingException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case InvitationNotFoundException:
      case InviteeNotFoundException:
        return super.catch(new NotFoundException(exception), host);

      case InvitationConflictException:
        return super.catch(new ConflictException(exception), host);

      case InsufficientPrivilegesException:
      case InviteeCannotBeOwnerException:
      case InviteeCannotBeSelfException:
        return super.catch(new ForbiddenException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
