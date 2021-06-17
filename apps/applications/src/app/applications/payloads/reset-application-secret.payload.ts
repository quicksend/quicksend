import { ResetApplicationSecretPayload as IResetApplicationSecretPayload } from "@quicksend/types";

import { FindApplicationPayload } from "./find-application.payload";

export class ResetApplicationSecretPayload
  extends FindApplicationPayload
  implements IResetApplicationSecretPayload {}
