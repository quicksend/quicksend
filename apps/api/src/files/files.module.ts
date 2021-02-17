import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

import { FoldersModule } from "../folders/folders.module";
import { ItemsModule } from "../items/items.module";
import { StorageModule } from "../storage/storage.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

import { FileEntity } from "./file.entity";

@Module({
  imports: [
    FoldersModule,

    ItemsModule,

    StorageModule,

    TypeOrmModule.forFeature([FileEntity]),

    UnitOfWorkModule
  ],
  controllers: [FilesController],
  exports: [FilesService],
  providers: [FilesService]
})
export class FilesModule {}
