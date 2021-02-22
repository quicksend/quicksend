import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException
} from "@nestjs/common";

import {
  CantFindFileException,
  FileConflictException,
  FileException
} from "./file.exceptions";

@Catch(FileException)
export class FilesExceptionFilter implements ExceptionFilter {
  catch(exception: FileException): void {
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
