import { ConfigType } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DiskStorageEngine } from "@quicksend/multiparter";

import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

import { FoldersModule } from "../folders/folders.module";
import { ItemsModule } from "../items/items.module";
import { MultiparterModule } from "../multiparter/multiparter.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

import { FileEntity } from "./file.entity";

import { engineNamespace, limitsNamespace } from "../config/config.namespaces";

@Module({
  imports: [
    FoldersModule,

    ItemsModule,

    MultiparterModule.registerAsync({
      inject: [engineNamespace.KEY, limitsNamespace.KEY],
      useFactory: (
        engineConfig: ConfigType<typeof engineNamespace>,
        limitsConfig: ConfigType<typeof limitsNamespace>
      ) => ({
        busboy: {
          limits: {
            files: limitsConfig.maxFiles,
            fileSize: limitsConfig.maxFileSize
          }
        },
        engine: new DiskStorageEngine(engineConfig.options.disk),
        field: "file",
        transformers: []
      })
    }),

    TypeOrmModule.forFeature([FileEntity]),

    UnitOfWorkModule
  ],
  controllers: [FilesController],
  exports: [FilesService],
  providers: [FilesService]
})
export class FilesModule {}
