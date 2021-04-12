export class UserException extends Error {}

export class EmailConflictException extends UserException {
  constructor() {
    super("The email is already in use.");
  }
}

export class IncorrectPasswordException extends UserException {
  constructor() {
    super("The old password is incorrect.");
  }
}

export class InvalidActivationTokenException extends UserException {
  constructor() {
    super("Invalid user activation token.");
  }
}

export class InvalidEmailConfirmationTokenException extends UserException {
  constructor() {
    super("Invalid email confirmation token.");
  }
}

export class InvalidPasswordResetTokenException extends UserException {
  constructor() {
    super("Invalid password reset token.");
  }
}

export class UsernameConflictException extends UserException {
  constructor() {
    super("The username is already in use.");
  }
}
