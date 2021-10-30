import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

import { EmailConfirmation } from "./entities/email-confirmation.entity";
import { PasswordReset } from "./entities/password-reset.entity";
import { User } from "./entities/user.entity";

import { UserSubscriber } from "./subscribers/user.subscriber";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [EmailConfirmation, PasswordReset, User]
    })
  ],
  controllers: [UsersController],
  exports: [UsersService],
  providers: [UserSubscriber, UsersService]
})
export class UsersModule {}
