export class ItemsException extends Error {}

export class CantFindItemException extends ItemsException {
  constructor() {
    super("This item cannot be found.");
  }
}
