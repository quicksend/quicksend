import { Global, Module } from "@nestjs/common";

import { EntityManagerService } from "./entity-manager.service";

@Global()
@Module({
  exports: [EntityManagerService],
  providers: [EntityManagerService]
})
export class EntityManagerModule {}
