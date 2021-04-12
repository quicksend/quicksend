import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { TransmitModule } from "@quicksend/nestjs-transmit";

import { FoldersModule } from "../folders/folders.module";
import { MailerModule } from "../mailer/mailer.module";
import { StorageModule } from "../storage/storage.module";

import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

import { PhysicalFile } from "./entities/physical-file.entity";
import { VirtualFile } from "./entities/virtual-file.entity";
import { VirtualFileInvitation } from "./entities/virtual-file-invitation.entity";

import { TransmitModuleConfig } from "../common/config/modules/transmit-module.config";

@Module({
  imports: [
    FoldersModule,

    MailerModule,

    MikroOrmModule.forFeature([PhysicalFile, VirtualFile, VirtualFileInvitation]),

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
