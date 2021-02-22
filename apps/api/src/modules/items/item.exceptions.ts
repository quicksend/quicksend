export class ItemException extends Error {}

export class CannotFindItemException extends ItemException {
  constructor() {
    super("This item cannot be found.");
  }
}

export class ItemConflictException extends ItemException {
  constructor() {
    super("An item already exist with this hash!");
  }
}
