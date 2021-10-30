import { ValidationError } from "class-validator";

export const flattenValidationError = (error: ValidationError): string[] => {
  const errors: string[] = [];

  if (error.constraints) {
    errors.push(...Object.values(error.constraints));
  }

  if (error.children) {
    errors.push(...error.children.flatMap((child) => flattenValidationError(child)));
  }

  return errors;
};
