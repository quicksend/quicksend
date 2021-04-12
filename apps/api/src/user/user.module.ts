import { Global, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { MailerModule } from "../mailer/mailer.module";
import { FoldersModule } from "../folders/folders.module";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";

import { UserSubscriber } from "./subscribers/user.subscriber";

import { ActivationToken } from "./entities/activation-token.entity";
import { EmailConfirmation } from "./entities/email-confirmation.entity";
import { PasswordReset } from "./entities/password-reset.entity";
import { User } from "./entities/user.entity";

@Global()
@Module({
  imports: [
    FoldersModule,

    MailerModule,

    MikroOrmModule.forFeature([ActivationToken, EmailConfirmation, PasswordReset, User])
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, UserSubscriber]
})
export class UserModule {}
