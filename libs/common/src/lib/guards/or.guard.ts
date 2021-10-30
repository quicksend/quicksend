import { CanActivate, ExecutionContext, Inject, Type, mixin } from "@nestjs/common";

import { ModuleRef } from "@nestjs/core";

import { Observable, from, of } from "rxjs";
import { last, mergeAll, takeWhile } from "rxjs/operators";

type PossibleGuardReturnTypes<T> = T | Observable<T> | Promise<T>;

export const OrGuard = (...guards: Type<CanActivate>[]): Type<CanActivate> => {
  class OrMixinGuard implements CanActivate {
    constructor(
      @Inject(ModuleRef)
      private readonly moduleRef: ModuleRef
    ) {}

    canActivate(ctx: ExecutionContext): Observable<boolean> {
      const observables = guards
        .map((guard) => this.moduleRef.get(guard))
        .map((guard) => guard.canActivate(ctx)) // run each guard with the execution context
        .map((value) => this.convertToObservable(value)); // convert return value into observable

      return from(observables).pipe(
        mergeAll(),
        takeWhile((value) => !value),
        last()
      );
    }

    private convertToObservable(value: PossibleGuardReturnTypes<boolean>): Observable<boolean> {
      if (this.isObservable(value)) {
        return value;
      }

      if (this.isPromise(value)) {
        return from(value);
      }

      return of(value);
    }

    private isObservable<T>(value: PossibleGuardReturnTypes<T>): value is Observable<T> {
      return !!(value as Observable<T>).pipe;
    }

    private isPromise<T>(value: PossibleGuardReturnTypes<T>): value is Promise<T> {
      return !!(value as Promise<T>).then;
    }
  }

  return mixin(OrMixinGuard);
};
