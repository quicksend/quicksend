import {
  AlreadyExistsRpcException,
  InvalidArgumentRpcException,
  NotFoundRpcException,
  PermissionDeniedRpcException
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

export class InvalidPasswordResetTokenException extends InvalidArgumentRpcException {
  constructor() {
    super("Invalid password reset token.");
  }
}

export class IncorrectOldPassword extends PermissionDeniedRpcException {
  constructor() {
    super("The old password is incorrect.");
  }
}

export class UsernameConflictException extends AlreadyExistsRpcException {
  constructor() {
    super("Username is already taken.");
  }
}

export class UserNotFoundException extends NotFoundRpcException {
  constructor() {
    super("User cannot be found.");
  }
}
