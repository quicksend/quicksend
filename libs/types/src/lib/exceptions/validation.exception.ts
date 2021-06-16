import { BaseException } from "./base.exception";

export interface ValidationException extends BaseException<"VALIDATION_ERROR"> {
  details: Array<{
    constraints: Record<string, string>;
    property: string;
  }>;
  message: string;
}
