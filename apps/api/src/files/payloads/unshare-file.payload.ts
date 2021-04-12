import { FilterQuery } from "@mikro-orm/core";

import { User } from "../../user/entities/user.entity";
import { VirtualFileInvitation } from "../entities/virtual-file-invitation.entity";

export interface UnshareFilePayload {
  invitation: FilterQuery<VirtualFileInvitation>;
  user: User;
}
