import {
  AlreadyExistsRpcException,
  InvalidArgumentRpcException,
  NotFoundRpcException
} from "@quicksend/common";

export class EmailConflictException extends AlreadyExistsRpcException {
  constructor() {
    super("The email is already in use.");
  }
}

export class InvalidEmailConfirmationTokenException extends InvalidArgumentRpcException {
  constructor() {
    super("Invalid email confirmation token.");
  }
}

export class ProfileNotFoundException extends NotFoundRpcException {
  constructor() {
    super("Profile cannot be found.");
  }
}

export class UserConflictException extends AlreadyExistsRpcException {
  constructor() {
    super("This user already has a profile.");
  }
}
