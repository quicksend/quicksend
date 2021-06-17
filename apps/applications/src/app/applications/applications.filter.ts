import { ArgumentsHost, Catch } from "@nestjs/common";

import { BaseRpcExceptionFilter } from "@nestjs/microservices";

import { Observable } from "rxjs";

import {
  ApplicationsException,
  ApplicationConflictException,
  ApplicationNotFoundException
} from "./applications.exceptions";

@Catch(ApplicationsException)
export class ApplicationsExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: ApplicationsException, host: ArgumentsHost): Observable<unknown> {
    switch (exception.constructor) {
      case ApplicationConflictException:
        return super.catch(exception, host);

      case ApplicationNotFoundException:
        return super.catch(exception, host);

      default:
        return super.catch(exception, host);
    }
  }
}
