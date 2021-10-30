import { ValidationError } from "class-validator";

import { flattenValidationError } from "./flatten-validation-error.util";

export const flattenValidationErrorArray = (arr: ValidationError[]): string[] => {
  return arr.flatMap((error) => flattenValidationError(error));
};
