import { FindConditions } from "typeorm";

import { ItemEntity } from "../item.entity";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeleteItemJob extends FindConditions<ItemEntity> {}
