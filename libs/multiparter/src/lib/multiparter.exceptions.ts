export enum MultiparterErrorCodes {
  FILE_TOO_LARGE = "File too large",
  TOO_MANY_FIELDS = "Too many fields",
  TOO_MANY_FILES = "Too many files",
  TOO_MANY_PARTS = "Too many parts",
  UNSUPPORTED_CONTENT_TYPE = "Unsupported content type"
}

export class MultiparterException extends Error {
  readonly isMultiparterError = true;

  constructor(readonly code: keyof typeof MultiparterErrorCodes) {
    super(MultiparterErrorCodes[code]);
  }
}
