import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException
} from "@nestjs/common";

import {
  FileConflictException,
  FileDestinationNotFoundException,
  FileException,
  FileNotFoundException
} from "./file.exceptions";

@Catch(FileException)
export class FilesExceptionFilter implements ExceptionFilter {
  catch(exception: FileException): void {
    switch (exception.constructor) {
      case FileConflictException:
        throw new ConflictException(exception.message);

      case FileDestinationNotFoundException:
        throw new NotFoundException(exception.message);

      case FileNotFoundException:
        throw new NotFoundException(exception.message);

      default:
        throw exception;
    }
  }
}
