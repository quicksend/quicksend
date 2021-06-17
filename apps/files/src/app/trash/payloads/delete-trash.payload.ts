import { DeleteTrashPayload as IDeleteTrashPayload } from "@quicksend/types";

import { FindTrashPayload } from "./find-trash.payload";

export class DeleteTrashPayload extends FindTrashPayload implements IDeleteTrashPayload {}
