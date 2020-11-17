import { ConflictException, NotFoundException } from "@nestjs/common";

export class FileAlreadyExists extends ConflictException {
  constructor(name: string | number, path?: string) {
    path
      ? super(`File '${name}' already exists at '${path}'`)
      : super(`File '${name}' already exists at this location!`);
  }
}

export class FileNotFound extends NotFoundException {
  constructor(name?: string | number) {
    name
      ? super(`File '${name}' does not exist!`)
      : super("File does not exist!");
  }
}
