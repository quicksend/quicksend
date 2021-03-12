import { HttpModule, Module } from "@nestjs/common";

import { MailerModule } from "@quicksend/nestjs-mailer";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { MailerModuleConfig } from "../config/modules/mailer-module.config";

@Module({
  imports: [
    HttpModule,

    MailerModule.registerAsync({
      useClass: MailerModuleConfig
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
