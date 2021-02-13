import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { getCustomRepository } from "typeorm";

import { FolderController } from "./folder.controller";
import { FolderEntity } from "./folder.entity";
import { FolderRepository } from "./folder.repository";
import { FolderService } from "./folder.service";

import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

@Module({
  imports: [TypeOrmModule.forFeature([FolderEntity]), UnitOfWorkModule],
  controllers: [FolderController],
  exports: [FolderService],
  providers: [FolderService]
})
export class FolderModule implements OnModuleInit {
  onModuleInit() {
    return getCustomRepository(FolderRepository).$setupCascadeDeleteFks();
  }
}
