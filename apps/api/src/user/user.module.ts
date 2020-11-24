import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "./user.controller";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";

import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UnitOfWorkModule],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService]
})
export class UserModule {}