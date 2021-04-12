import { ValidationPipe as BaseValidationPipe, ValidationPipeOptions } from "@nestjs/common";

import { ValidationException } from "../filters/validation-exception.filter";

export const DEFAULT_VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  exceptionFactory: (errors) => new ValidationException(errors),
  transform: true,
  validationError: {
    target: false,
    value: false
  },
  whitelist: true
};

export const ValidationPipe = (options?: Partial<ValidationPipeOptions>): BaseValidationPipe => {
  return new BaseValidationPipe({
    ...DEFAULT_VALIDATION_PIPE_OPTIONS,
    ...options
  });
};
