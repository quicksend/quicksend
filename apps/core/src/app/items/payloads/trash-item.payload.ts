import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

import { Transform } from "class-transformer";

export class TrashItemPayload {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value) {
      return new Date(Date.now() + value);
    }

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    return new Date(Date.now() + THIRTY_DAYS);
  })
  autoDeleteOn?: Date;

  @IsNotEmpty()
  @IsString()
  item!: string;

  @IsNotEmpty()
  @IsString()
  trashedBy!: string;
}
