import { HttpException as BaseHttpException, HttpStatus as HttpStatusCode } from "@nestjs/common";

export class HttpException<T = unknown> extends BaseHttpException {
  readonly code: HttpStatusCode;
  readonly details?: T;
  readonly type: string;

  constructor(code: HttpStatusCode, message: string, details?: T) {
    super(message, code);
    this.code = code;
    this.details = details;
    this.type = HttpStatusCode[code];
  }
}
