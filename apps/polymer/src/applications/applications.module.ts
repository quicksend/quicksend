import { Global, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";

import { Application } from "./entities/application.entity";

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Application]
    })
  ],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
  providers: [ApplicationsService]
})
export class ApplicationsModule {}
