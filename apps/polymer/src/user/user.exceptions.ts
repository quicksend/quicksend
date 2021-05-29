export class UserException extends Error {}

export class EmailConflictException extends UserException {
  constructor() {
    super("The email is already in use.");
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

export class UserNotFoundException extends UserException {
  constructor() {
    super("User cannot be found.");
  }
}
