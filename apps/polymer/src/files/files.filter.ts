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
  FileConflictException,
  FileDestinationCannotBeChildrenOfSelf,
  FileDestinationNotFoundException,
  FileIncapableException,
  FileNotFoundException,
  FilesException,
  ParentIncapableException
} from "./files.exceptions";

@Catch(FilesException)
export class FilesExceptionFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(exception: FilesException, host: ArgumentsHost): void {
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
