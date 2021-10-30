import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";

import { Application } from "./entities/application.entity";

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
