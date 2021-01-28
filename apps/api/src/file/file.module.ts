import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileController } from "./file.controller";
import { FileEntity } from "./file.entity";
import { FileService } from "./file.service";

import { FolderModule } from "../folder/folder.module";
import { ItemModule } from "../item/item.module";
import { StorageModule } from "../storage/storage.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

@Module({
  imports: [
    FolderModule,

    ItemModule,

    StorageModule,

    TypeOrmModule.forFeature([FileEntity]),

    UnitOfWorkModule
  ],
  controllers: [FileController],
  exports: [FileService],
  providers: [FileService]
})
export class FileModule {}
