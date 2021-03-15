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
          new PayloadTooLargeException(exception.message),
          host
        );

      case FieldValueTooLargeException:
        return super.catch(
          new PayloadTooLargeException(exception.message),
          host
        );

      case FileTooLargeException:
        return super.catch(
          new PayloadTooLargeException(exception.message),
          host
        );

      case FileTooSmallException:
        return super.catch(new BadRequestException(exception.message), host);

      case NotEnoughFieldsException:
        return super.catch(new BadRequestException(exception.message), host);

      case NotEnoughFilesException:
        return super.catch(new BadRequestException(exception.message), host);

      case TooManyFieldsException:
        return super.catch(new BadRequestException(exception.message), host);

      case TooManyFilesException:
        return super.catch(new BadRequestException(exception.message), host);

      case TooManyPartsException:
        return super.catch(new BadRequestException(exception.message), host);

      case UnsupportedContentTypeException:
        return super.catch(
          new UnsupportedMediaTypeException(exception.message),
          host
        );

      default:
        return super.catch(
          new InternalServerErrorException(exception.message),
          host
        );
    }
  }
}
