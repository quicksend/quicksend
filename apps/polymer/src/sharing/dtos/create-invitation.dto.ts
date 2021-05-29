import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinDate
} from "class-validator";

import { Type } from "class-transformer";

import { Privileges } from "../enums/privileges.enum";

export class CreateInvitationDto {
  @IsDate()
  @IsOptional()
  @MinDate(new Date())
  @Type(() => Date)
  expiresAt?: Date;

  @IsNotEmpty()
  @IsString()
  file!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  invitee?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  message?: string;

  @IsBoolean()
  @IsOptional()
  notifyInvitee = true;

  @ArrayUnique()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  privileges!: Array<keyof typeof Privileges>;
}
