import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { UsersModule } from "../users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { Token } from "./entities/token.entity";

@Module({
  imports: [
    JwtModule.register({}),

    MikroOrmModule.forFeature({
      entities: [Token]
    }),

    UsersModule
  ],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService]
})
export class AuthModule {}
