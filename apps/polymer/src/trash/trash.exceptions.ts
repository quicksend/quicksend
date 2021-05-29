export class TrashException extends Error {}

export class TrashNotFoundException extends TrashException {
  constructor() {
    super("Trash cannot be found.");
  }
}
