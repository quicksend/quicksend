import { createBullBoard } from "bull-board";

/**
 * A static version of bull board that allows manipulation of queues from anywhere
 */
export class BullBoard {
  private static readonly board = createBullBoard([]);

  constructor() {
    throw new Error(`The ${this.constructor.name} class cannot be instantiated.`);
  }

  static addQueues(...args: Parameters<ReturnType<typeof createBullBoard>["addQueue"]>): void {
    return this.board.addQueue(...args);
  }

  static getRouter(): ReturnType<typeof createBullBoard>["router"] {
    return this.board.router;
  }

  static removeQueues(
    ...args: Parameters<ReturnType<typeof createBullBoard>["removeQueue"]>
  ): void {
    return this.board.removeQueue(...args);
  }

  static replaceQueues(
    ...args: Parameters<ReturnType<typeof createBullBoard>["replaceQueues"]>
  ): void {
    return this.board.replaceQueues(...args);
  }

  static setQueues(...args: Parameters<ReturnType<typeof createBullBoard>["setQueues"]>): void {
    return this.board.setQueues(...args);
  }
}
