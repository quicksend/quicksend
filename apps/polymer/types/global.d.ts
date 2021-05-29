declare type Constructor<T> = new (...args: never[]) => T;
declare type Maybe<T, V = undefined> = T | V;
