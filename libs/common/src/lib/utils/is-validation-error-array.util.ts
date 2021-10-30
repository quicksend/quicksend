import { ValidationError } from "class-validator";

export const isValidationErrorArray = (arr: unknown): arr is ValidationError[] => {
  return Array.isArray(arr) && arr.every((error) => error instanceof ValidationError);
};
