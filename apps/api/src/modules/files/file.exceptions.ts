import { FileEntity } from "./file.entity";

export class FileException extends Error {}

export class FileConflictException extends FileException {
  constructor(file: FileEntity) {
    super(`File '${file.name}' already exists at '${file.parent.name}'!`);
  }
}

export class FileDestinationNotFoundException extends FileException {
  constructor(destination?: string) {
    destination
      ? super(`Destination '${destination}' does not exist!`)
      : super(`Destination does not exist!`);
  }
}

export class FileNotFoundException extends FileException {
  constructor(details?: {
    entity?: FileEntity;
    location?: string;
    name?: string;
  }) {
    const { entity, location, name } = details || {};

    if (entity) {
      location
        ? super(`File '${entity.name}' does not exist at '${location}'!`)
        : super(`File '${entity.name}' does not exist!`);
    } else if (name) {
      location
        ? super(`File '${name}' does not exist at '${location}'!`)
        : super(`File '${name}' does not exist!`);
    } else {
      location
        ? super(`File does not exist at '${location}'!`)
        : super(`File does not exist!`);
    }
  }
}
