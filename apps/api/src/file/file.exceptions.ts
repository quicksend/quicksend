import {
  ConflictException,
  ForbiddenException,
  NotFoundException
} from "@nestjs/common";

export class FileAlreadyExistsException extends ConflictException {
  constructor(name: string, path?: string) {
    path
      ? super(`File '${name}' already exists at '${path}'`)
      : super(`File '${name}' already exists at this location!`);
  }
}

export class FileIsGhostedException extends ForbiddenException {
  constructor(intent: string) {
    super(`You cannot ${intent} a ghosted file!`);
  }
}

export class FileNotFoundException extends NotFoundException {
  constructor(name?: string) {
    name
      ? super(`File '${name}' does not exist!`)
      : super("File does not exist!");
  }
}
