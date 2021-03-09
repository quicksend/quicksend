import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException
} from "@nestjs/common";

import {
  CantFindFileException,
  FileConflictException,
  FilesException
} from "./files.exceptions";

@Catch(FilesException)
export class FilesExceptionFilter implements ExceptionFilter {
  catch(exception: FilesException): void {
    switch (exception.constructor) {
      case CantFindFileException:
        throw new NotFoundException(exception.message);

      case FileConflictException:
        throw new ConflictException(exception.message);

      default:
        throw exception;
    }
  }
}
