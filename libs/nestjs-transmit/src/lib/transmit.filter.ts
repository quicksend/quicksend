import {
  BadRequestException,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException
} from "@nestjs/common";

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
export class TransmitExceptionFilter implements ExceptionFilter {
  catch(exception: TransmitException): void {
    switch (exception.constructor) {
      case FieldNameTooLargeException:
        throw new PayloadTooLargeException("Field name too large!");

      case FieldValueTooLargeException:
        throw new PayloadTooLargeException("Field value too large!");

      case FileTooLargeException:
        throw new PayloadTooLargeException("File too large!");

      case FileTooSmallException:
        throw new BadRequestException("File too small!");

      case NotEnoughFieldsException:
        throw new BadRequestException("Not enough fields!");

      case NotEnoughFilesException:
        throw new BadRequestException("Not enough files!");

      case TooManyFieldsException:
        throw new BadRequestException("Too many fields!");

      case TooManyFilesException:
        throw new BadRequestException("Too many files!");

      case TooManyPartsException:
        throw new BadRequestException("Too many parts!");

      case UnsupportedContentTypeException:
        throw new UnsupportedMediaTypeException();

      default:
        throw new InternalServerErrorException(exception);
    }
  }
}
