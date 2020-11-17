import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";

import { FolderModule } from "../folder/folder.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

import { UserEntity } from "./entities/user.entity";

@Global()
@Module({
  imports: [
    FolderModule,

    TypeOrmModule.forFeature([UserEntity]),

    UnitOfWorkModule
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService]
})
export class UserModule {}
