import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IgxRadialGaugeModule } from 'igniteui-angular-gauges';
import { fromEvent, interval, Observable, takeUntil, tap } from 'rxjs';
import { ComponentDestroy } from 'src/app/core/unsubscribe';
import { GaugeStore } from './state/gause.state';

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
  standalone: true,
  providers: [GaugeStore],
  imports: [CommonModule, IgxRadialGaugeModule, MatIconModule, MatButtonModule]
})
export class GaugeComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild("btnRemove", { static: false, read: ElementRef })
  btnRemove?: ElementRef | undefined;

  @Input("title")
  title: string = '';

  @Output("data")
  data$: Observable<number[]> = this.gaugeService.data$;

  @Output("lastValue")
  lastValue$ = this.gaugeService.lastValue$;

  @Output("remove")
  remove = new EventEmitter();

  // subject indicating that component is destroying
  private destroy$ = ComponentDestroy(this);

  // the current value of the gauge
  protected currentValue = Math.ceil(Math.random() * 100);

  constructor(private readonly gaugeService: GaugeStore) { }

  ngAfterViewInit(): void {
    // subscribing to btnRemove click event
    fromEvent(this.btnRemove?.nativeElement, 'click').pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.remove.emit();
      })
    ).subscribe();
  }

  ngOnDestroy(): void { }

  ngOnInit(): void {

    this.gaugeService.generateData(this.currentValue);

    // getting dummy values
    interval(1000).pipe(
      // taking data until component is alive
      takeUntil(this.destroy$),
      tap(() => {
        // getting new value
        const direction = Math.round(Math.random() * 100)
        const value = (direction >= 50 ? 1 : -1) * Math.round(Math.random() * 10)
        let newValue = this.currentValue + value;
        if (newValue < 0) {
          newValue = 0;
        } else if (newValue > 100) {
          newValue = 100;
        }

        this.gaugeService.generateData(newValue);
      })
    ).subscribe();

    this.gaugeService.lastValue$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(l => {
      this.currentValue = l;
    });
  }
}
