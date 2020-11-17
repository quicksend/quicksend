import { ConflictException, UnauthorizedException } from "@nestjs/common";

export class EmailTaken extends ConflictException {
  constructor() {
    super("Email is already in use!");
  }
}

export class PasswordIsIncorrectException extends UnauthorizedException {
  constructor() {
    super("Your password is incorrect!");
  }
}

export class UsernameTaken extends ConflictException {
  constructor() {
    super("Username is already in use!");
  }
}
