import { Global, Module } from "@nestjs/common";

import { UnitOfWorkService } from "./unit-of-work.service";

@Global()
@Module({
  exports: [UnitOfWorkService],
  providers: [UnitOfWorkService]
})
export class UnitOfWorkModule {}
