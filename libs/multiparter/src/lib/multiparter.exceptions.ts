import {
  BadRequestException,
  HttpStatus,
  PayloadTooLargeException,
  UnsupportedMediaTypeException
} from "@nestjs/common";

export class FileTooLarge extends PayloadTooLargeException {
  static message = "The file(s) you tried to upload is too large!";
  static status = HttpStatus.PAYLOAD_TOO_LARGE;

  constructor(filename: string) {
    super(`File '${filename}' is too large!`);
  }

  static get description(): string {
    return `${FileTooLarge.name}: ${FileTooLarge.message}`;
  }
}

export class TooManyFields extends BadRequestException {
  static message = "You have exceeded the maximum amont of fields per request!";
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyFields.message);
  }

  static get description(): string {
    return `${TooManyFields.name}: ${TooManyFields.message}`;
  }
}

export class TooManyFiles extends BadRequestException {
  static message =
    "You have exceeded the maximum amount of files you can upload per request!";
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyFiles.message);
  }

  static get description(): string {
    return `${TooManyFiles.name}: ${TooManyFiles.message}`;
  }
}

export class TooManyParts extends BadRequestException {
  static message = "You have exceeded the maximum amount of parts per request!";
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyParts.name);
  }

  static get description(): string {
    return `${TooManyParts.name}: ${TooManyParts.message}`;
  }
}

export class UnsupportedContentType extends UnsupportedMediaTypeException {
  static message = "Missing or unsupported content type!";
  static status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;

  constructor() {
    super(UnsupportedContentType.message);
  }

  static get description(): string {
    return `${UnsupportedContentType.name}: ${UnsupportedContentType.message}`;
  }
}
