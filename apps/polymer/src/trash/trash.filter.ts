import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

import { TrashException, TrashNotFoundException } from "./trash.exceptions";

@Catch(TrashException)
export class TrashExceptionFilter extends HttpExceptionFilter implements ExceptionFilter {
  catch(exception: TrashNotFoundException, host: ArgumentsHost): void {
    switch (exception.constructor) {
      case TrashNotFoundException:
        return super.catch(new NotFoundException(exception), host);

      default:
        return super.catch(new InternalServerErrorException(exception), host);
    }
  }
}
