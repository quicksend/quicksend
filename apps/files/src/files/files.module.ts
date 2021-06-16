import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { InvitationsModule } from "../invitations/invitations.module";

import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

import { File } from "./entities/file.entity";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [File]
    }),

    InvitationsModule
  ],
  controllers: [FilesController],
  exports: [FilesService],
  providers: [FilesService]
})
export class FilesModule {}
