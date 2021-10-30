import { Module } from "@nestjs/common";

import { BullBoardService } from "./bull-board.service";

@Module({
  exports: [BullBoardService],
  providers: [BullBoardService]
})
export class BullBoardModule {}
