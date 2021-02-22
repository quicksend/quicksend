import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException
} from "@nestjs/common";

import {
  CannotFindItemException,
  ItemConflictException,
  ItemException
} from "./item.exceptions";

@Catch(ItemException)
export class ItemsExceptionFilter implements ExceptionFilter {
  catch(exception: ItemException): void {
    switch (exception.constructor) {
      case CannotFindItemException:
        throw new NotFoundException(exception.message);

      case ItemConflictException:
        throw new ConflictException(exception.message);

      default:
        throw exception;
    }
  }
}
