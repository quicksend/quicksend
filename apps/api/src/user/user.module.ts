import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "./user.controller";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";
import { UserSubscriber } from "./user.subscriber";

import { FoldersModule } from "../folders/folders.module";

@Global()
@Module({
  imports: [FoldersModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, UserSubscriber]
})
export class UserModule {}
