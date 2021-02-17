import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { getCustomRepository } from "typeorm";

import { FolderController } from "./folders.controller";
import { FoldersService } from "./folders.service";

import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

import { FolderEntity } from "./folder.entity";
import { FolderRepository } from "./folder.repository";

@Module({
  imports: [TypeOrmModule.forFeature([FolderEntity]), UnitOfWorkModule],
  controllers: [FolderController],
  exports: [FoldersService],
  providers: [FoldersService]
})
export class FoldersModule implements OnModuleInit {
  onModuleInit() {
    return getCustomRepository(FolderRepository).$setupCascadeDeleteFks();
  }
}
