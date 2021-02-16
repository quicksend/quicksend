import {
  Injectable,
  ValidationPipe as BaseValidationPipe,
  ValidationPipeOptions
} from "@nestjs/common";

export const DEFAULT_VALIDATION_PIPE_OPTIONS: Readonly<ValidationPipeOptions> = {
  transform: true,
  whitelist: true
};

@Injectable()
export class ValidationPipe extends BaseValidationPipe {
  constructor(
    options: ValidationPipeOptions = DEFAULT_VALIDATION_PIPE_OPTIONS
  ) {
    super(options);
  }
}
