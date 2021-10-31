import { Module } from "@nestjs/common";

import { EntityManagerService } from "./entity-manager.service";

@Module({
  exports: [EntityManagerService],
  providers: [EntityManagerService]
})
export class EntityManagerModule {}
