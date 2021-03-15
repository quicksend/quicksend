import { Module } from "@nestjs/common";

import { TransactionService } from "./transaction.service";

@Module({
  exports: [TransactionService],
  providers: [TransactionService]
})
export class TransactionModule {}
