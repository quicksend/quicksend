import { HttpExceptionResponsePayload } from "./http-exception-response-payload.interface";

export interface ValidationExceptionResponsePayload extends HttpExceptionResponsePayload {
  details: Array<{
    constraints: Record<string, unknown>;
    property: string;
  }>;
}
