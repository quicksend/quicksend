import { createBullBoard } from "@bull-board/api";

import { BaseAdapter } from "@bull-board/api/dist/src/queueAdapters/base";

import { ExpressAdapter } from "@bull-board/express";

import { Injectable } from "@nestjs/common";

@Injectable()
export class BullBoardService {
  readonly adapter = new ExpressAdapter();

  readonly board = createBullBoard({
    queues: [],
    serverAdapter: this.adapter
  });

  addQueues(...queues: BaseAdapter[]): void {
    this.board.setQueues(queues);
  }

  removeQueue(queue: BaseAdapter): void {
    this.board.removeQueue(queue);
  }
}
