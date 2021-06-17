import { DeleteInvitationPayload as IDeleteInvitationPayload } from "@quicksend/types";

import { IsBoolean, IsOptional } from "class-validator";

import { FindInvitationPayload } from "./find-invitation.payload";

export class DeleteInvitationPayload
  extends FindInvitationPayload
  implements IDeleteInvitationPayload {
  @IsBoolean()
  @IsOptional()
  removeDescendants?: boolean;
}
