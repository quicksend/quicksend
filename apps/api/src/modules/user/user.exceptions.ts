export class UserException extends Error {}

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

export class UsernameConflictException extends UserException {
  constructor() {
    super("This username is already in use!");
  }
}
