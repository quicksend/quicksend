import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TransmitModule } from "@quicksend/nestjs-transmit";
import { TransmitModuleConfig } from "../config/modules/transmit-module.config";

import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

import { FoldersModule } from "../folders/folders.module";
import { ItemsModule } from "../items/items.module";

import { FileEntity } from "./file.entity";
import { FilePolicyEntity } from "./entities/file-policy.entity";

@Module({
  imports: [
    FoldersModule,

    ItemsModule,

    TransmitModule.registerAsync({
      useClass: TransmitModuleConfig
    }),

    TypeOrmModule.forFeature([FileEntity, FilePolicyEntity])
  ],
  controllers: [FilesController],
  exports: [FilesService],
  providers: [FilesService]
})
export class FilesModule {}
