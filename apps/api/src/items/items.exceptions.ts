export class ItemsException extends Error {}

export class CannotFindItemException extends ItemsException {
  constructor() {
    super("This item cannot be found.");
  }
}
