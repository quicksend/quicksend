import {
  BadRequestException,
  HttpStatus,
  PayloadTooLargeException,
  UnsupportedMediaTypeException
} from "@nestjs/common";

export class FileTooLargeException extends PayloadTooLargeException {
  static message = "The file(s) you tried to upload is too large!";
  static status = HttpStatus.PAYLOAD_TOO_LARGE;

  constructor(filename: string) {
    super(`File '${filename}' is too large!`);
  }

  static get description(): string {
    return `${FileTooLargeException.name}: ${FileTooLargeException.message}`;
  }
}

export class TooManyFieldsException extends BadRequestException {
  static message = "You have exceeded the maximum amont of fields per request!";
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyFieldsException.message);
  }

  static get description(): string {
    return `${TooManyFieldsException.name}: ${TooManyFieldsException.message}`;
  }
}

export class TooManyFilesException extends BadRequestException {
  static message =
    "You have exceeded the maximum amount of files you can upload per request!";
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyFilesException.message);
  }

  static get description(): string {
    return `${TooManyFilesException.name}: ${TooManyFilesException.message}`;
  }
}

export class TooManyPartsException extends BadRequestException {
  static message = "You have exceeded the maximum amount of parts per request!";
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyPartsException.name);
  }

  static get description(): string {
    return `${TooManyPartsException.name}: ${TooManyPartsException.message}`;
  }
}

export class UnsupportedContentTypeException extends UnsupportedMediaTypeException {
  static message = "Missing or unsupported content type!";
  static status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;

  constructor() {
    super(UnsupportedContentTypeException.message);
  }

  static get description(): string {
    return `${UnsupportedContentTypeException.name}: ${UnsupportedContentTypeException.message}`;
  }
}
