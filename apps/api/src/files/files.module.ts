import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TransmitModule } from "@quicksend/nest-transmit";
import { TransmitModuleConfig } from "../config/modules/transmit-module.config";

import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

import { FoldersModule } from "../folders/folders.module";
import { ItemsModule } from "../items/items.module";

import { FileEntity } from "./file.entity";

@Module({
  imports: [
    FoldersModule,

    ItemsModule,

    TransmitModule.registerAsync({
      useClass: TransmitModuleConfig
    }),

    TypeOrmModule.forFeature([FileEntity])
  ],
  controllers: [FilesController],
  exports: [FilesService],
  providers: [FilesService]
})
export class FilesModule {}
