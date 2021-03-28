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
  CantAccessFileException,
  CantFindFileException,
  CantFindFileInvitationException,
  FileConflictException,
  FileInviteeCannotBeOwner,
  FilesException
} from "./files.exceptions";

@Catch(FilesException)
export class FilesExceptionFilter
  extends HttpExceptionFilter
  implements ExceptionFilter {
  catch(exception: FilesException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case CantAccessFileException:
        return super.catch(new ForbiddenException(exception), host);

      case CantFindFileException:
        return super.catch(new NotFoundException(exception), host);

      case CantFindFileInvitationException:
        return super.catch(new NotFoundException(exception), host);

      case FileConflictException:
        return super.catch(new ConflictException(exception), host);

      case FileInviteeCannotBeOwner:
        return super.catch(new ForbiddenException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
