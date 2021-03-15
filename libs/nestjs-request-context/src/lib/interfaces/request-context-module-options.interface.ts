import { RequestContextConstructor } from "./request-context-constructor.interface";

export interface RequestContextModuleOptions<T> {
  context: RequestContextConstructor<T>;
  isGlobal?: boolean;
}
