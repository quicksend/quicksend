import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileController } from "./file.controller";
import { FileService } from "./file.service";

import { FolderModule } from "../folder/folder.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

import { FileEntity } from "./entities/file.entity";
import { ItemEntity } from "./entities/item.entity";

@Module({
  imports: [
    forwardRef(() => FolderModule),

    TypeOrmModule.forFeature([FileEntity, ItemEntity]),

    UnitOfWorkModule
  ],
  controllers: [FileController],
  exports: [FileService],
  providers: [FileService]
})
export class FileModule {}
