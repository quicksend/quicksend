import { Global, Module } from "@nestjs/common";

import { RepositoriesService } from "./repositories.service";

@Global()
@Module({
  exports: [RepositoriesService],
  providers: [RepositoriesService]
})
export class RepositoriesModule {}
