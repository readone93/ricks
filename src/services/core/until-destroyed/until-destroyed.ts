import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

const untilDestroyedSymbol = Symbol("untilDestroyed");

/**
 * RxJS operator that unsubscribe from observables on destory.
 * Code forked from https://github.com/NetanelBasal/ngx-take-until-destroy
 */

export function untilDestroyed(
  instance: object,
  destroyMethodName: string = "ngOnDestroy"
) {
  return <T>(source: Observable<T>) => {
    const originalDestroy = instance[destroyMethodName];
    const hasDestroyFunction = typeof originalDestroy === "function";

    if (!hasDestroyFunction) {
      throw new Error(
        `${instance.constructor.name} is using untilDestroyed but doesn't implement ${destroyMethodName}`
      );
    }

    if (!instance[untilDestroyedSymbol]) {
      instance[untilDestroyedSymbol] = new Subject();

      instance[destroyMethodName] = function () {
        if (hasDestroyFunction) {
          originalDestroy.apply(this, arguments);
        }
        instance[untilDestroyedSymbol].next();
        instance[untilDestroyedSymbol].complete();
      };
    }

    return source.pipe(takeUntil<T>(instance[untilDestroyedSymbol]));
  };
}
