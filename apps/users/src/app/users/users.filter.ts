import { ArgumentsHost, Catch } from "@nestjs/common";

import { BaseRpcExceptionFilter } from "@nestjs/microservices";

import { Observable } from "rxjs";

import {
  EmailConflictException,
  InvalidEmailConfirmationTokenException,
  InvalidPasswordResetTokenException,
  UsersException,
  UsernameConflictException
} from "./users.exceptions";

@Catch(UsersException)
export class UsersExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: UsersException, host: ArgumentsHost): Observable<unknown> {
    switch (exception.constructor) {
      case EmailConflictException:
      case UsernameConflictException:
        return super.catch(exception, host);

      case InvalidEmailConfirmationTokenException:
      case InvalidPasswordResetTokenException:
        return super.catch(exception, host);

      default:
        return super.catch(exception, host);
    }
  }
}
