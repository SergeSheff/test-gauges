import { Subject } from "rxjs";

interface onDestroyLike {
  ngOnDestroy(): void
}


export function ComponentDestroy(component: onDestroyLike): Subject<{}> {
  const onDestroy = component.ngOnDestroy;

  const s$ = new Subject<{}>();

  component.ngOnDestroy = () => {

    if (onDestroy) {
      onDestroy.apply(component);
    }

    s$.next({});
    s$.complete();
  }

  return s$;
}
