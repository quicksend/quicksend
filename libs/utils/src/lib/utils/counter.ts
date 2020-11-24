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

  decrement(): this {
    this._value -= 1;
    this.emit(String(this.value));

    return this;
  }

  increment(): this {
    this._value += 1;
    this.emit(String(this.value));

    return this;
  }

  is(n: number): boolean {
    return this.value === n;
  }

  onceItEqualsTo(n: number, cb: () => void): this {
    if (this.value === n) {
      cb();
    } else {
      this.once(String(n), cb);
    }

    return this;
  }

  set(value: number): this {
    this._value = value;
    this.emit(String(this.value));

    return this;
  }

  whenItEqualsTo(n: number, cb: () => void): this {
    if (this.value === n) {
      cb();
    }

    this.on(String(n), cb);

    return this;
  }
}
