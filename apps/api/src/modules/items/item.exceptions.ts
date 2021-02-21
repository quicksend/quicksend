export class ItemException extends Error {}

export class CannotFindItemException extends ItemException {
  constructor() {
    super("This item cannot be found.");
  }
}
