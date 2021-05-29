import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module, forwardRef } from "@nestjs/common";

import { FilesModule } from "../files/files.module";
import { MailerModule } from "../mailer/mailer.module";

import { SharingController } from "./sharing.controller";
import { SharingService } from "./sharing.service";

import { Invitation } from "./entities/invitation.entity";

@Module({
  imports: [
    forwardRef(() => FilesModule),

    MailerModule,

    MikroOrmModule.forFeature({
      entities: [Invitation]
    })
  ],
  controllers: [SharingController],
  exports: [SharingService],
  providers: [SharingService]
})
export class SharingModule {}
