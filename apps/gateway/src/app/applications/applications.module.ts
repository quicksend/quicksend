import { Module } from "@nestjs/common";

import { AuthGuard } from "../common/guards/auth.guard";

import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";

@Module({
  controllers: [ApplicationsController],
  providers: [AuthGuard, ApplicationsService]
})
export class ApplicationsModule {}
