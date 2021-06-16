import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { FilesModule } from "../files/files.module";

import { InvitationsController } from "./invitations.controller";
import { InvitationsService } from "./invitations.service";

import { Invitation } from "./entities/invitation.entity";

@Module({
  imports: [
    FilesModule,

    MikroOrmModule.forFeature({
      entities: [Invitation]
    })
  ],
  controllers: [InvitationsController],
  exports: [InvitationsService],
  providers: [InvitationsService]
})
export class InvitationsModule {}
