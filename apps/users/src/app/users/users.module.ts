import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { UsersController } from "./users.controller";
import { UsersRelay } from "./users.relay";
import { UsersService } from "./users.service";

import { EmailConfirmation } from "./entities/email-confirmation.entity";
import { PasswordReset } from "./entities/password-reset.entity";
import { UserEvent } from "./entities/user-event.entity";
import { User } from "./entities/user.entity";

import { UserSubscriber } from "./subscribers/user.subscriber";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [EmailConfirmation, PasswordReset, User, UserEvent]
    })
  ],
  controllers: [UsersController],
  exports: [UsersService],
  providers: [UsersRelay, UsersService, UserSubscriber]
})
export class UsersModule {}
