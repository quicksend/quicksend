import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

import {
  CantFindFileException,
  FileConflictException,
  FilesException
} from "./files.exceptions";

@Catch(FilesException)
export class FilesExceptionFilter
  extends HttpExceptionFilter
  implements ExceptionFilter {
  catch(exception: FilesException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case CantFindFileException:
        return super.catch(new NotFoundException(exception), host);

      case FileConflictException:
        return super.catch(new ConflictException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
