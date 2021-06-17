import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";

import { BaseRpcExceptionFilter } from "@nestjs/microservices";

import { Observable } from "rxjs";

import {
  InsufficientPrivilegesException,
  InvitationConflictException,
  InvitationNotFoundException,
  InviteeCannotBeOwnerException,
  InviteeCannotBeSelfException,
  InviteeNotFoundException,
  InvitationsException
} from "./invitations.exceptions";

@Catch(InvitationsException)
export class InvitationsExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: InvitationsException, host: ArgumentsHost): Observable<unknown> {
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
