import { BadRequestException, ParseUUIDPipe } from "@nestjs/common";

export const ParseUUIDV4Pipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException("Invalid uuid provided"),
  version: "4"
});
