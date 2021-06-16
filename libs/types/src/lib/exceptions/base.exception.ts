export interface BaseException<T extends string> {
  timestamp: number;
  type: T;
}
