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
  CantFindFileException,
  CantFindFileDestinationException,
  CantFindFileInvitationException,
  CantFindFileInvitee,
  FileConflictException,
  FileInviteeCannotBeOwner,
  FilesException,
  InsufficientPrivilegesException
} from "./files.exceptions";

@Catch(FilesException)
export class FilesExceptionFilter
  extends HttpExceptionFilter
  implements ExceptionFilter {
  catch(exception: FilesException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case CantFindFileException:
        return super.catch(new NotFoundException(exception), host);

      case CantFindFileDestinationException:
        return super.catch(new NotFoundException(exception), host);

      case CantFindFileInvitationException:
        return super.catch(new NotFoundException(exception), host);

      case CantFindFileInvitee:
        return super.catch(new NotFoundException(exception), host);

      case FileConflictException:
        return super.catch(new ConflictException(exception), host);

      case FileInviteeCannotBeOwner:
        return super.catch(new ForbiddenException(exception), host);

      case InsufficientPrivilegesException:
        return super.catch(new ForbiddenException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
