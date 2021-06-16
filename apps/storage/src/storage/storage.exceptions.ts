import { RpcException } from "@nestjs/microservices";

export class StorageException extends RpcException {}

export class PhysicalFileNotFoundException extends StorageException {
  constructor() {
    super("Physical file does not exists");
  }
}
