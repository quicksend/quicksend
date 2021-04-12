import { HttpExceptionResponsePayload } from "./http-exception-response-payload.interface";

export interface HttpExceptionResponseBody<T = HttpExceptionResponsePayload> {
  error: T;
}
