import { NotFoundRpcException } from "@quicksend/common";

export class FileNotFoundException extends NotFoundRpcException {
  constructor() {
    super("Physical file does not exist.");
  }
}
