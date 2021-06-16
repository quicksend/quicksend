import {
  ArgumentsHost,
  Catch,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";

import { BaseRpcExceptionFilter } from "@nestjs/microservices";

import { Observable } from "rxjs";

import { TrashException, TrashNotFoundException } from "./trash.exceptions";

@Catch(TrashException)
export class TrashExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: TrashNotFoundException, host: ArgumentsHost): Observable<unknown> {
    switch (exception.constructor) {
      case TrashNotFoundException:
        return super.catch(new NotFoundException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
