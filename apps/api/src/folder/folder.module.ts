import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FolderController } from "./folder.controller";
import { FolderEntity } from "./folder.entity";
import { FolderService } from "./folder.service";

import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

@Module({
  imports: [TypeOrmModule.forFeature([FolderEntity]), UnitOfWorkModule],
  controllers: [FolderController],
  exports: [FolderService],
  providers: [FolderService]
})
export class FolderModule {}
