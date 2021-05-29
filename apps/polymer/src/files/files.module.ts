import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module, forwardRef } from "@nestjs/common";

import { TransmitModule } from "@quicksend/nestjs-transmit";

import { TransmitModuleConfig } from "../common/config/modules/transmit-module.config";

import { SharingModule } from "../sharing/sharing.module";
import { StorageModule } from "../storage/storage.module";

import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

import { File } from "./entities/file.entity";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [File]
    }),

    forwardRef(() => SharingModule),

    StorageModule,

    TransmitModule.registerAsync({
      imports: [StorageModule],
      inject: [StorageModule],
      useClass: TransmitModuleConfig
    })
  ],
  controllers: [FilesController],
  exports: [FilesService],
  providers: [FilesService]
})
export class FilesModule {}
