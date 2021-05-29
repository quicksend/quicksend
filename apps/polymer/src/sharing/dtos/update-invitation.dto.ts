import { PickType } from "@nestjs/mapped-types";

import { CreateInvitationDto } from "./create-invitation.dto";

export class UpdateInvitationDto extends PickType(CreateInvitationDto, [
  "expiresAt",
  "privileges"
]) {}
