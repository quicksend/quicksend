import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FolderController } from "./folder.controller";
import { FolderEntity } from "./folder.entity";
import { FolderService } from "./folder.service";

import { FileModule } from "../file/file.module";
import { UnitOfWorkModule } from "../unit-of-work/unit-of-work.module";

@Module({
  imports: [
    forwardRef(() => FileModule),

    TypeOrmModule.forFeature([FolderEntity]),

    UnitOfWorkModule
  ],
  controllers: [FolderController],
  exports: [FolderService],
  providers: [FolderService]
})
export class FolderModule {}
