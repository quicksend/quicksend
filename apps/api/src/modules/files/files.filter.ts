import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException
} from "@nestjs/common";

import {
  CantFindFileDestinationException,
  CantFindFileException,
  FileConflictException,
  FileException
} from "./file.exceptions";

@Catch(FileException)
export class FilesExceptionFilter implements ExceptionFilter {
  catch(exception: FileException): void {
    switch (exception.constructor) {
      case CantFindFileDestinationException:
        throw new NotFoundException(exception.message);

      case CantFindFileException:
        throw new NotFoundException(exception.message);

      case FileConflictException:
        throw new ConflictException(exception.message);

      default:
        throw exception;
    }
  }
}
