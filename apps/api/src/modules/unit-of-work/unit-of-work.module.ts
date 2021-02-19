import { Module } from "@nestjs/common";

import { UnitOfWorkService } from "./unit-of-work.service";

@Module({
  exports: [UnitOfWorkService],
  providers: [UnitOfWorkService]
})
export class UnitOfWorkModule {}
