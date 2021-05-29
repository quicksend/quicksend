import { Privileges } from "../enums/privileges.enum";

import { User } from "../../user/entities/user.entity";

export interface CheckPrivilegesPayload {
  path: string;
  privileges: Privileges[];
  user?: User;
}
