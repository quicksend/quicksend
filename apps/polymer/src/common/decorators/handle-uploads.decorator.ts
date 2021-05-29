import { UseFilters, UseInterceptors, applyDecorators } from "@nestjs/common";

import { TransmitExceptionFilter, TransmitInterceptor } from "@quicksend/nestjs-transmit";
import { TransmitOptions } from "@quicksend/transmit";

export const HandleUploads = (
  options?: Partial<TransmitOptions>
): ReturnType<typeof applyDecorators> => {
  return applyDecorators(
    UseFilters(TransmitExceptionFilter),
    UseInterceptors(TransmitInterceptor(options))
  );
};
