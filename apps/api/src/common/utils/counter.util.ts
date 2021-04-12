import { EventEmitter } from "events";

export class Counter extends EventEmitter {
  private _value: number;

  constructor(value = 0) {
    super();
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  decrement(amount = 1): this {
    this._value -= amount;
    this.emit(String(this._value));

    return this;
  }

  increment(amount = 1): this {
    this._value += amount;
    this.emit(String(this._value));

    return this;
  }

  is(n: number): boolean {
    return this._value === n;
  }

  onceItEqualsTo(n: number, cb: () => void): void {
    if (this._value === n) {
      return cb();
    }

    this.once(String(n), cb);
  }

  set(value: number): this {
    this._value = value;
    this.emit(String(this._value));

    return this;
  }

  whenItEqualsTo(n: number, cb: () => void): void {
    this.on(String(n), cb);

    if (this._value === n) {
      cb();
    }
  }
}
