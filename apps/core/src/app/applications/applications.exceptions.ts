import { AlreadyExistsRpcException, NotFoundRpcException } from "@quicksend/common";

export class ApplicationConflictException extends AlreadyExistsRpcException {
  constructor() {
    super("An application already exist with this name.");
  }
}

export class ApplicationNotFoundException extends NotFoundRpcException {
  constructor() {
    super("The application cannot be found.");
  }
}
