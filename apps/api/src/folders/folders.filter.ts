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
  CantDeleteFolderException,
  CantFindDestinationFolderException,
  CantFindFolderException,
  CantMoveFolderException,
  CantMoveFolderIntoChildrenException,
  CantMoveFolderIntoItselfException,
  FolderConflictException,
  FoldersException
} from "./folders.exceptions";

@Catch(FoldersException)
export class FoldersExceptionFilter
  extends HttpExceptionFilter
  implements ExceptionFilter {
  catch(exception: FoldersException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case CantFindDestinationFolderException:
      case CantFindFolderException:
        return super.catch(new NotFoundException(exception), host);

      case CantDeleteFolderException:
      case CantMoveFolderException:
      case CantMoveFolderIntoChildrenException:
      case CantMoveFolderIntoItselfException:
        return super.catch(new ForbiddenException(exception), host);

      case FolderConflictException:
        return super.catch(new ConflictException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
