import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { TransmitModule } from "@quicksend/nestjs-transmit";

import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";

import { StorageManager } from "../storage/storage.manager";
import { StorageModule } from "../storage/storage.module";

import { DownloadSession } from "./entities/download-session.entity";
import { UploadSession } from "./entities/upload-session.entity";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [DownloadSession, UploadSession]
    }),

    StorageModule,

    TransmitModule.registerAsync({
      inject: [StorageManager],
      useFactory: (storageManager: StorageManager) => ({
        manager: {
          createWritableStream(file): Promise<NodeJS.WritableStream> {
            return storageManager.createWritableStream(file.discriminator);
          },
          deleteFile(file): Promise<void> {
            return storageManager.unlink(file.name);
          }
        }
      })
    })
  ],
  controllers: [SessionsController],
  exports: [SessionsService],
  providers: [SessionsService]
})
export class SessionsModule {}
