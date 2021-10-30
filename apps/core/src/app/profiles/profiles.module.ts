import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { ProfilesController } from "./profiles.controller";
import { ProfilesService } from "./profiles.service";

import { Profile } from "./entities/profile.entity";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Profile]
    })
  ],
  controllers: [ProfilesController],
  exports: [ProfilesService],
  providers: [ProfilesService]
})
export class ProfilesModule {}
