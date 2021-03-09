import { HttpExceptionResponseBody } from "./http-exception-response-body.interface";

export type ValidationExceptionResponseBody = HttpExceptionResponseBody<{
  details: Array<{
    constraints: Record<string, unknown>;
    property: string;
  }>;
  type: string;
}>;
