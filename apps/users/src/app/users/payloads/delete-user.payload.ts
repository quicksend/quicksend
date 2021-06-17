import { DeleteUserPayload as IDeleteUserPayload } from "@quicksend/types";

import { FindUserPayload } from "./find-user.payload";

export class DeleteUserPayload extends FindUserPayload implements IDeleteUserPayload {}
