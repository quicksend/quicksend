import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException
} from "@nestjs/common";

import { BaseExceptionFilter } from "@nestjs/core";

import {
  FieldNameTooLargeException,
  FieldValueTooLargeException,
  FileTooLargeException,
  FileTooSmallException,
  NotEnoughFieldsException,
  NotEnoughFilesException,
  TooManyFieldsException,
  TooManyFilesException,
  TooManyPartsException,
  TransmitException,
  UnsupportedContentTypeException
} from "@quicksend/transmit";

@Catch(TransmitException)
export class TransmitExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter {
  catch(exception: TransmitException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case FieldNameTooLargeException:
        return super.catch(
          new PayloadTooLargeException("Field name too large!"),
          host
        );

      case FieldValueTooLargeException:
        return super.catch(
          new PayloadTooLargeException("Field value too large!"),
          host
        );

      case FileTooLargeException:
        return super.catch(
          new PayloadTooLargeException("File too large!"),
          host
        );

      case FileTooSmallException:
        return super.catch(new BadRequestException("File too small!"), host);

      case NotEnoughFieldsException:
        return super.catch(new BadRequestException("Not enough fields!"), host);

      case NotEnoughFilesException:
        return super.catch(new BadRequestException("Not enough files!"), host);

      case TooManyFieldsException:
        return super.catch(new BadRequestException("Too many fields!"), host);

      case TooManyFilesException:
        return super.catch(new BadRequestException("Too many files!"), host);

      case TooManyPartsException:
        return super.catch(new BadRequestException("Too many parts!"), host);

      case UnsupportedContentTypeException:
        return super.catch(new UnsupportedMediaTypeException(), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
