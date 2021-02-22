import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";

import { ApplicationEntity } from "./application.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity]), UnitOfWorkModule],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
  providers: [ApplicationsService]
})
export class ApplicationsModule {}
