import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";

import { ApplicationEntity } from "./application.entity";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity])],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
  providers: [ApplicationsService]
})
export class ApplicationsModule {}
