import { RpcException } from "@nestjs/microservices";

export class ApplicationsException extends RpcException {}

export class ApplicationConflictException extends ApplicationsException {
  constructor() {
    super("An application already exist with this name.");
  }
}

export class ApplicationNotFoundException extends ApplicationsException {
  constructor() {
    super("The application cannot be found.");
  }
}
