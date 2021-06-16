import {
  ArgumentsHost,
  Catch,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";

import { BaseRpcExceptionFilter } from "@nestjs/microservices";

import { Observable } from "rxjs";

import {
  DownloadSessionNotFoundException,
  SessionsException,
  UploadSessionNotFoundException
} from "./sessions.exceptions";

@Catch(SessionsException)
export class SessionsExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: SessionsException, host: ArgumentsHost): Observable<unknown> {
    switch (exception.constructor) {
      case DownloadSessionNotFoundException:
      case UploadSessionNotFoundException:
        return super.catch(new NotFoundException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
