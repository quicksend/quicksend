import { CanActivate, ExecutionContext, Injectable, Type, mixin } from "@nestjs/common";

import { ModuleRef } from "@nestjs/core";

import { Observable, from, of } from "rxjs";
import { last, mergeAll, takeWhile } from "rxjs/operators";

type PossibleGuardReturnTypes = boolean | Observable<boolean> | Promise<boolean>;

export const OrGuard = (...guards: Type<CanActivate>[]): Type<CanActivate> => {
  @Injectable()
  class OrMixinGuard implements CanActivate {
    constructor(private readonly moduleRef: ModuleRef) {}

    canActivate(ctx: ExecutionContext): Observable<boolean> {
      const observables = guards
        .map((guard) => this.moduleRef.get(guard))
        .map((guard) => guard.canActivate(ctx)) // run each guard with the execution context
        .map((value) => this.convertToObservable(value)); // convert return value into observable

      return from(observables).pipe(
        mergeAll(),
        takeWhile((value) => value === false),
        last()
      );
    }

    private convertToObservable(value: PossibleGuardReturnTypes): Observable<boolean> {
      if (this.isObservable(value)) {
        return value;
      }

      if (this.isPromise(value)) {
        return from(value);
      }

      return of(value);
    }

    private isObservable(value: PossibleGuardReturnTypes): value is Observable<boolean> {
      return !!(value as Observable<unknown>).pipe;
    }

    private isPromise(value: PossibleGuardReturnTypes): value is Promise<boolean> {
      return !!(value as Promise<unknown>).then;
    }
  }

  return mixin(OrMixinGuard);
};
