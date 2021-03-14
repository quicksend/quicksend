import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserSubscriber } from "./user.subscriber";

import { EmailConfirmationEntity } from "./entities/email-confirmation.entity";
import { PasswordResetEntity } from "./entities/password-reset.entity";
import { UserEntity } from "./user.entity";

import { FoldersModule } from "../folders/folders.module";

@Global()
@Module({
  imports: [
    FoldersModule,

    TypeOrmModule.forFeature([
      EmailConfirmationEntity,
      PasswordResetEntity,
      UserEntity
    ])
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, UserSubscriber]
})
export class UserModule {}
