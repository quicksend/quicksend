import { RpcException } from "@nestjs/microservices";

export class UsersException extends RpcException {}

export class EmailConflictException extends UsersException {
  constructor() {
    super("The email is already in use.");
  }
}

export class InvalidEmailConfirmationTokenException extends UsersException {
  constructor() {
    super("Invalid email confirmation token.");
  }
}

export class InvalidPasswordResetTokenException extends UsersException {
  constructor() {
    super("Invalid password reset token.");
  }
}

export class UsernameConflictException extends UsersException {
  constructor() {
    super("The username is already in use.");
  }
}

export class UserNotFoundException extends UsersException {
  constructor() {
    super("User cannot be found.");
  }
}
