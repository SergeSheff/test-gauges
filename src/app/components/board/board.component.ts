import { AfterViewInit, Component, ComponentRef, ElementRef, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { combineLatest, fromEvent, Subscription, takeUntil, tap, take, interval, throttleTime, BehaviorSubject, filter } from 'rxjs';
import { ComponentDestroy } from 'src/app/core/unsubscribe';
import { GaugeComponent } from 'src/app/shared/gauge/gauge.component';
import { EMPTY_SUBSCRIPTION } from 'rxjs/internal/Subscription';
import { ChartData } from './chart-data.class';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { CdkTable } from '@angular/cdk/table'
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements AfterViewInit, OnDestroy {

  @ViewChild("gaugesContainer", { read: ViewContainerRef })
  gaugesContainer: ViewContainerRef | undefined;

  @ViewChild("btnAdd", { static: false, read: ElementRef })
  btnAdd: ElementRef | undefined;

  @ViewChild("tblResults", { read: ElementRef<MatTable<CdkTable<any>>> })
  tblResults: ElementRef<MatTable<CdkTable<any>>> | undefined;

  // max rows in table
  private readonly MAX_ROWS = 10;

  // max gauges count
  private readonly MAX_GAUGES_COUNT = 5;

  private destroy$ = ComponentDestroy(this);
  private refreshGauges$ = new BehaviorSubject<void>(undefined);
  protected guageSubscription$: Subscription = EMPTY_SUBSCRIPTION;

  private gauges = new Array<ComponentRef<GaugeComponent>>;
  public ChartData = ChartData;

  // gauges counter
  private gaugeNumber = 0;

  protected guageData = new MatTableDataSource<ChartData>([]);
  protected columnsToDisplay = ['time'];

  constructor(private mSnackBar: MatSnackBar) { }

  ngAfterViewInit(): void {
    // removing all components
    this.gaugesContainer?.clear();

    // init add button
    fromEvent(this.btnAdd?.nativeElement, "click").pipe(
      takeUntil(this.destroy$),
      tap(() => {

        // if count of gauges was not exceeded
        if (this.gauges.length < this.MAX_GAUGES_COUNT) {
          // creating new component
          const newComponent = this.gaugesContainer?.createComponent(GaugeComponent) as ComponentRef<GaugeComponent>;

          // assigning title
          newComponent.instance.title = `Gauge #${++this.gaugeNumber}`;

          // handle gause removal
          this.handleGaugeRemoval(newComponent);

          // creating a new property for the line chart data
          const propertyName = ChartData.addChart(this.gaugeNumber);

          // adding new column the list of table columns
          this.columnsToDisplay.push(propertyName);

          // adding a new gauge to the board
          this.gauges.push(newComponent);

          // refreshing subscriptions
          this.refreshGauges$.next();
        } else {
          // displaying an error that max count of gauses was exceeded
          this.mSnackBar.open("The maximun count of gauges was exceeded", "close");
        }
      })
    ).subscribe();

    // event which will happen when new gause will be added / removed
    this.handleRefreshGauges();
  }

  ngOnDestroy(): void { }


  // handle refresh gauses event
  private handleRefreshGauges() {
    this.refreshGauges$.pipe(
      takeUntil(this.destroy$),
      tap(() => this.handleGaugeData())
    ).subscribe()
  }

  // handle gauges data
  private handleGaugeData() {
    // re-subscribing
    if (this.guageSubscription$) this.guageSubscription$.unsubscribe();

    this.guageSubscription$ = combineLatest([
      interval(1000),
      ...this.gauges.map(l => l.instance.lastValue$)
    ]).pipe(
      takeUntil(this.destroy$),
      throttleTime(1000, undefined, { leading: true, trailing: true }),
      tap((l) => {
        // processing new item
        const newItem = ChartData.processData(l);
        let res = [...this.guageData.data, newItem];

        // if there are more than max rows records in the table
        // remove old records
        if (res.length > this.MAX_ROWS) {
          res.splice(0, res.length - this.MAX_ROWS);
        }

        this.guageData.data = res;
      }),
    ).subscribe();
  }

  // handaling of gauge remval
  private handleGaugeRemoval(newComponent: ComponentRef<GaugeComponent>) {
    newComponent.instance.remove.pipe(
      take(1),
      tap(() => {
        const idx = this.gauges.findIndex((l) => l == newComponent);
        if (idx >= 0) {
          // removing gauge from table header
          this.columnsToDisplay.splice(idx + 1, 1);

          // removing observers
          this.gauges.splice(idx, 1);

          // removing gauge from template
          this.gaugesContainer?.remove(idx);

          // updateing subscriptions
          this.refreshGauges$.next();
        }
      })
    ).subscribe();
  }

}
