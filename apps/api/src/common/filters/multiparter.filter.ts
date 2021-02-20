import {
  BadRequestException,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException
} from "@nestjs/common";

import { MultiparterException } from "@quicksend/multiparter";

@Catch(MultiparterException)
export class MultiparterExceptionFilter implements ExceptionFilter {
  catch(exception: MultiparterException): void {
    switch (exception.code) {
      case "FILE_TOO_LARGE":
        throw new PayloadTooLargeException(
          "The file you tried to upload was too large!"
        );

      case "TOO_MANY_FIELDS":
        throw new BadRequestException("Too many fields!");

      case "TOO_MANY_FILES":
        throw new BadRequestException("Too many files!");

      case "TOO_MANY_PARTS":
        throw new BadRequestException("Too many parts!");

      case "UNSUPPORTED_CONTENT_TYPE":
        throw new UnsupportedMediaTypeException();

      default:
        throw new InternalServerErrorException(exception);
    }
  }
}
