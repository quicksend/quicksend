import { RpcException } from "@nestjs/microservices";

export class TrashException extends RpcException {}

export class TrashNotFoundException extends TrashException {
  constructor() {
    super("Trash cannot be found.");
  }
}
