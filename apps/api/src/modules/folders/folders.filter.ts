import {
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  NotFoundException
} from "@nestjs/common";

import {
  CantDeleteFolderException,
  CantFindDestinationFolderException,
  CantFindFolderException,
  CantMoveFolderException,
  CantMoveFolderIntoChildrenException,
  CantMoveFolderIntoItselfException,
  FolderConflictException,
  FolderException
} from "./folder.exceptions";

@Catch(FolderException)
export class FoldersExceptionFilter implements ExceptionFilter {
  catch(exception: FolderException): void {
    switch (exception.constructor) {
      case CantDeleteFolderException:
        throw new ForbiddenException(exception.message);

      case CantFindDestinationFolderException:
        throw new NotFoundException(exception.message);

      case CantFindFolderException:
        throw new NotFoundException(exception.message);

      case CantMoveFolderException:
        throw new ForbiddenException(exception.message);

      case CantMoveFolderIntoChildrenException:
        throw new ForbiddenException(exception.message);

      case CantMoveFolderIntoItselfException:
        throw new ForbiddenException(exception.message);

      case FolderConflictException:
        throw new ConflictException(exception.message);

      default:
        throw exception;
    }
  }
}
