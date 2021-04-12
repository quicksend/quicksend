import { HttpExceptionResponsePayload } from "./http-exception-response-payload.interface";

import { ValidationError } from "class-validator";

export interface ValidationExceptionResponsePayload extends HttpExceptionResponsePayload {
  details: Array<{
    children: ValidationError[];
    constraints: Record<string, unknown>;
    property: string;
  }>;
}
