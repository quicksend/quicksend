import { ConflictException, UnauthorizedException } from "@nestjs/common";

export class EmailTakenException extends ConflictException {
  constructor() {
    super("Email is already in use!");
  }
}

export class PasswordIsIncorrectException extends UnauthorizedException {
  constructor() {
    super("Your password is incorrect!");
  }
}

export class UsernameTakenException extends ConflictException {
  constructor() {
    super("Username is already in use!");
  }
}
