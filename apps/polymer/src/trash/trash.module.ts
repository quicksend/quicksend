import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { TrashController } from "./trash.controller";
import { TrashService } from "./trash.service";

import { Trash } from "./entities/trash.entity";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Trash]
    })
  ],
  controllers: [TrashController],
  exports: [TrashService],
  providers: [TrashService]
})
export class TrashModule {}
