import { Module } from "@nestjs/common";

import { AuthGuard } from "../common/guards/auth.guard";

import { ItemsController } from "./items.controller";
import { ItemsService } from "./items.service";

@Module({
  controllers: [ItemsController],
  providers: [AuthGuard, ItemsService]
})
export class ItemsModule {}
