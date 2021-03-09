import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { getCustomRepository } from "typeorm";

import { FolderController } from "./folders.controller";
import { FoldersService } from "./folders.service";

import { FolderEntity } from "./folder.entity";
import { FolderRepository } from "./folder.repository";

@Module({
  imports: [TypeOrmModule.forFeature([FolderEntity])],
  controllers: [FolderController],
  exports: [FoldersService],
  providers: [FoldersService]
})
export class FoldersModule implements OnModuleInit {
  onModuleInit() {
    return getCustomRepository(FolderRepository).$setupCascadeDeleteFks();
  }
}
