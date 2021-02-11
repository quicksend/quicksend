import {
  ConflictException,
  ForbiddenException,
  NotFoundException
} from "@nestjs/common";

export class FolderAlreadyExistsException extends ConflictException {
  constructor(name?: string, path = "this location") {
    name
      ? super(`Folder '${name}' already exists at ${path}`)
      : super(`Folder already exists at ${path}!`);
  }
}

export class FolderCannotBeDeletedException extends ForbiddenException {
  constructor(name?: string) {
    name
      ? super(`Folder '${name}' cannot be deleted!`)
      : super("You cannot delete this folder!");
  }
}

export class FolderNotFoundException extends NotFoundException {
  constructor(name?: string) {
    name
      ? super(`Folder '${name}' does not exist!`)
      : super("Folder does not exist!");
  }
}

export class ParentFolderNotFoundException extends NotFoundException {
  constructor(name?: string) {
    name
      ? super(`Parent folder '${name}' does not exist!`)
      : super("Parent folder does not exist!");
  }
}
