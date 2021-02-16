import {
  DEFAULT_VALIDATION_PIPE_OPTIONS,
  ValidationPipe
} from "./validation.pipe";

/*
 * This should be used as a pipe when you want to validate the
 * output of a custom decorator. This is to prevent setting
 * `validateCustomDecorators` to true on the global validation pipe
 * to prevent validating decorators that shouldn't be validated.
 */
export const ValidateCustomDecoratorPipe = new ValidationPipe({
  ...DEFAULT_VALIDATION_PIPE_OPTIONS,
  validateCustomDecorators: true
});
