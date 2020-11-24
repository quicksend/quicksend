import { ConflictException, NotFoundException } from "@nestjs/common";

export class FolderAlreadyExistsException extends ConflictException {
  constructor(name: string | number, path?: string) {
    path
      ? super(`Folder '${name}' already exists at '${path}'`)
      : super(`Folder '${name}' already exists at this location!`);
  }
}

export class FolderNotFoundException extends NotFoundException {
  constructor(name?: string | number) {
    name
      ? super(`Folder '${name}' does not exist!`)
      : super("Folder does not exist!");
  }
}

export class ParentFolderNotFoundException extends NotFoundException {
  constructor(name?: string | number) {
    name
      ? super(`Parent folder '${name}' does not exist!`)
      : super("Parent folder does not exist!");
  }
}
