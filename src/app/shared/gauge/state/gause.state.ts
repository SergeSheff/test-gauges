import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { delay, mergeMap, Observable, of, range, switchMap, tap, take, concatMap, EMPTY } from "rxjs";

export interface GaugeState {
  data: number[]
}

@Injectable()
export class GaugeStore extends ComponentStore<GaugeState>{

  constructor() {
    super({ data: [] });
  }

  readonly data$: Observable<number[]> = this.select(state => state.data);
  readonly lastValue$: Observable<number> = this.select(this.data$, (l) => {
    if (l && l.length > 0) {
      return l[l.length - 1];
    }

    return 0;
  });

  readonly setData = this.updater((state, newData: number) => ({
    data: [...state.data, newData]
  }));

  readonly generateData = this.effect((v: Observable<number>) => {
    this.setData(v);
    return EMPTY;
  });
}
