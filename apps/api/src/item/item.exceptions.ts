import { ConflictException, NotFoundException } from "@nestjs/common";

export class ItemAlreadyExists extends ConflictException {
  constructor(hash?: string) {
    hash
      ? super(`Item '${hash}' already exists!`)
      : super("Item already exists!");
  }
}

export class ItemNotFound extends NotFoundException {
  constructor(hash?: string) {
    hash
      ? super(`Item '${hash}' does not exist!`)
      : super("Item does not exist!");
  }
}
