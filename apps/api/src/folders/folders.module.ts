import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { FolderController } from "./folders.controller";
import { FoldersService } from "./folders.service";

import { Folder } from "./entities/folder.entity";
import { FolderTree } from "./entities/folder-tree.entity";

@Module({
  imports: [MikroOrmModule.forFeature([Folder, FolderTree])],
  controllers: [FolderController],
  exports: [FoldersService],
  providers: [FoldersService]
})
export class FoldersModule {}
