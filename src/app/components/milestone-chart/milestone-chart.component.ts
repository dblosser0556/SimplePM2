import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { DecimalPipe } from '@angular/common';

export interface MilestoneChartMilestone {
  value: string;
  label: string;
  date: string;
}
export interface MilestoneChartScaleLabel {
  value: string;
  label: string;
}

export interface Marker {
  date: string;
  label: string;
  x: number;
}

export interface ChartBar {
  date: string;
  label: string;
  width: number;
  fill: string;
  fillOpacity: number;
  x: number;
  strokeWidth: number;
  strokeDasharray: string;
  textAnchor: string;

}

export interface ChartBarStop {
  offset: string;
  style: SafeStyle;
}


@Component({
  selector: 'app-milestone-chart',
  templateUrl: './milestone-chart.component.html',
  styleUrls: ['./milestone-chart.component.scss']
})
export class MilestoneChartComponent implements OnInit {

  @Input() milestones: MilestoneChartMilestone[];
  @Input() scaleLabels: MilestoneChartScaleLabel[];
  @Input() maxScale: number;
  @Input() scaleTime = false;
  @Input() startDate: string;
  @Input() barColors: string[];
  @Input() gradiantStops: ChartBarStop[];
  @Input() scaleValue = false;
  @Input() barValues: MilestoneChartMilestone[];
  @Input() domain: Number[];
  @Input() target: MilestoneChartMilestone;

  // error checking
  private noStartDate = false;
  private noTarget = false;
  private noErrors = false;

  private topMarkers: Marker[] = [];
  private btmMarkers: Marker[] = [];
  private maxScaleValue: number;
  private eventBars: ChartBar[] = [];

  private viewWidth = 800;
  private viewHeight = 50;

  constructor(private sanitizer: DomSanitizer, private dp: DecimalPipe) { }

  ngOnInit() {

    // setup some defaults as not all parameters need to be passed.
    if (this.scaleTime === false && this.scaleValue === false) {
      this.scaleValue = true;
    }

    if (this.maxScale === undefined) { this.maxScale = 1.40; }

    // set up the default stops if not passed in.
    if (this.gradiantStops === undefined) {
      this.gradiantStops = new Array<ChartBarStop>();

      const stops = [75, 80, 85, 90, 110, 115, 120, 140];
      const stopColors = ['#FFFFFF', '#FF0000', '#FFFF00', '#00FF00', '#00FF00', '#FFFF00', '#FF0000', '#FF0000'];
      const style = 'stop-color:???;stop-opacity:1';

      for (let i = 0; i < stops.length; i++) {
        const _style = this.sanitizer.bypassSecurityTrustStyle(style.replace('???', stopColors[i]));
        const chartBarStop: ChartBarStop = {
          offset: (stops[i] / this.maxScale).toString() + '%',
          style: _style
        };
        this.gradiantStops.push(chartBarStop);
      }
    }

    if (this.barColors === undefined) { this.barColors = ['#9f02f9', '#2f02f9', '#029ff0']; }
    // check for errors
    // check for target input
    if (this.target === undefined) {
      this.noTarget = true;
    }


    if (this.scaleTime) {
      if (this.startDate === undefined) {
        this.noStartDate = true;
      }
    }

    if (this.noTarget === false && this.noStartDate === false) {
      this.noErrors = true;
    }


    // start the layout
    this.maxScaleValue = this.calcMaxScaleValue();

    this.topMarkers = this.calcTopMarkers();

    this.btmMarkers = this.calcBtmMarkers();

    this.eventBars = this.addEvents();

  }

  calcMaxScaleValue(): number {
    if (this.scaleTime) {
      // calculate the max time
      let targetDate = moment(this.target.date);
      targetDate = targetDate.endOf('month');

      let startDate = moment(this.startDate);
      startDate = startDate.startOf('month');

      const diff = targetDate.diff(startDate, 'days') * this.maxScale;
      return diff;
    } else {
      return Number(this.target.value) * this.maxScale;
    }
  }

  calcTopMarkers(): Marker[] {
    const topMarkers: Marker[] = [];
    if (this.milestones !== undefined) {
      if (this.scaleTime) {
        // set of the start this will be x=0;
        const startDate = moment(this.startDate).startOf('month');


        for (const milestone of this.milestones) {
          const milestoneDate = moment(milestone.date).endOf('month');
          const x = milestoneDate.diff(startDate, 'days') / this.maxScaleValue * this.viewWidth;
          const topMarker: Marker = {
            date: moment(milestone.date).format('MM-YY'),
            label: milestone.label,
            x: x
          };
          topMarkers.push(topMarker);
        }
      } else {
        for (const milestone of this.milestones) {
          const x = Number(milestone.value) / this.maxScaleValue * this.viewWidth;
          const topMarker: Marker = {
            date: moment(milestone.date).format('MM-YY'),
            label: milestone.label,
            x: x
          };
          topMarkers.push(topMarker);
        }


      }
    }


    return topMarkers;
  }

  calcBtmMarkers(): Marker[] {
    const btmMarkers: Marker[] = [];

    // scaleLabels come in %Value
    if (this.scaleLabels !== undefined) {
      for (const scaleLabel of this.scaleLabels) {
        const x = Number(scaleLabel.value) / 100 * this.viewWidth / this.maxScale;
        const btmMarker: Marker = {
          date: '',
          label: scaleLabel.label,
          x: x
        };
        btmMarkers.push(btmMarker);
      }
    }

    return btmMarkers;
  }

  addEvents(): ChartBar[] {
    const barValues: ChartBar[] = [];
    if (this.barValues !== undefined) {

      // set of the start this will be x=0;
      const startDate = moment(this.startDate).startOf('month');

      let width = 0;
      let i = 0;
      let label = '';
      for (const barValue of this.barValues) {
        // determin the value
        const eventDate = moment(barValue.date).endOf('month');
        if (this.scaleTime) {
          width = eventDate.diff(startDate, 'days') / this.maxScaleValue * this.viewWidth;
          label = barValue.label + ' - ' + eventDate.format('MM-YY');
        } else {
          width = Number(barValue.value) / this.maxScaleValue * this.viewWidth;
          label = barValue.label + ' - ' + this.formatBarValue(barValue.value);
        }


        const curEvent: ChartBar = {
          date: eventDate.format('MM-YY'),
          label: label,
          width: width,
          fill: this.barColors[i % this.barColors.length],
          fillOpacity: 1,
          x: width / 2,
          strokeWidth: 1,
          strokeDasharray: 'none',
          textAnchor: 'middle'

        };

        // determine the fill.

        if (barValue.label === 'Plan') {
          curEvent.fill = '#FFFFFF';
          curEvent.fillOpacity = 0.5;
          curEvent.strokeDasharray = '20,10,5,5,5,10';
          curEvent.textAnchor = 'end';
          curEvent.strokeWidth = 5;
          curEvent.x = curEvent.width - 10;
        }

        barValues.push(curEvent);
        i++;

      }
    }

    return this.sortEvents(barValues);
  }


  // sort the chart barValues in reverse order so the largest is laid down first
  sortEvents(barValues: ChartBar[]): ChartBar[] {
    const chartEvents = barValues.sort((leftside, rightside): number => {
      if (leftside.width < rightside.width) { return 1; }
      if (leftside.width > rightside.width) { return -1; }
      return 0;
    });
    return chartEvents;
  }

  formatBarValue(value: string): string {
    const _value = Number(value);
    if (_value > 1000000) {
      return this.dp.transform(_value / 1000000, '1.2-2') + 'MM';
    }
    if (_value > 1000) {
      return this.dp.transform(_value / 1000, '1.0-0') + 'M';
    }
    return this.dp.transform(_value, '1.0-0');

  }
}



