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
  FileConflictException,
  FileDestinationCannotBeChildrenOfSelf,
  FileDestinationNotFoundException,
  FileIncapableException,
  FileNotFoundException,
  FilesException,
  ParentIncapableException
} from "./files.exceptions";

@Catch(FilesException)
export class FilesExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: FilesException, host: ArgumentsHost): Observable<unknown> {
    switch (exception.constructor) {
      case FileDestinationNotFoundException:
      case FileNotFoundException:
        return super.catch(new NotFoundException(exception), host);

      case FileConflictException:
        return super.catch(new ConflictException(exception), host);

      case FileDestinationCannotBeChildrenOfSelf:
      case FileIncapableException:
      case ParentIncapableException:
        return super.catch(new ForbiddenException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
