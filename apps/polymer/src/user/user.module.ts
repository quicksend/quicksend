import { Global, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { MailerModule } from "../mailer/mailer.module";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";

import { UserSubscriber } from "./subscribers/user.subscriber";

import { EmailConfirmation } from "./entities/email-confirmation.entity";
import { PasswordReset } from "./entities/password-reset.entity";
import { User } from "./entities/user.entity";

@Global()
@Module({
  imports: [
    MailerModule,

    MikroOrmModule.forFeature({
      entities: [EmailConfirmation, PasswordReset, User]
    })
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, UserSubscriber]
})
export class UserModule {}
