export class UserException extends Error {}

export class CantFindUserException extends UserException {
  constructor() {
    super("This user cannot be found.");
  }
}

export class EmailConflictException extends UserException {
  constructor() {
    super("This email is already in use!");
  }
}

export class IncorrectPasswordException extends UserException {
  constructor() {
    super("Your password is incorrect!");
  }
}

export class InvalidEmailConfirmationTokenException extends UserException {
  constructor() {
    super("Invalid email confirmation token!");
  }
}

export class InvalidPasswordResetTokenException extends UserException {
  constructor() {
    super("Invalid password reset token!");
  }
}

export class UsernameConflictException extends UserException {
  constructor() {
    super("This username is already in use!");
  }
}
