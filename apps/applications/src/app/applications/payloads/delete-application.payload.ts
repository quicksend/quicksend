import { DeleteApplicationPayload as IDeleteApplicationPayload } from "@quicksend/types";

import { FindApplicationPayload } from "./find-application.payload";

export class DeleteApplicationPayload
  extends FindApplicationPayload
  implements IDeleteApplicationPayload {}
