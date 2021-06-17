import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  Min
} from "class-validator";

import {
  InvitationPrivileges,
  UpdateInvitationPayload as IUpdateInvitationPayload
} from "@quicksend/types";

import { FindInvitationPayload } from "./find-invitation.payload";
import { Type } from "class-transformer";

class UpdateInvitationFields {
  @IsNumber()
  @IsOptional()
  @Min(Date.now())
  expiresAt?: number;

  @ArrayMinSize(1)
  @ArrayUnique()
  @IsArray()
  @IsEnum(InvitationPrivileges, { each: true })
  @IsOptional()
  privileges?: Array<keyof typeof InvitationPrivileges>;
}

export class UpdateInvitationPayload
  extends FindInvitationPayload
  implements IUpdateInvitationPayload {
  @Type(() => UpdateInvitationFields)
  data!: UpdateInvitationFields;
}
