import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import { Project } from '../../../models';
import * as moment from 'moment';

export interface SeriesData {
  name: string;
  value: number;
}

export interface ChartData {
  name: string;
  series: SeriesData[];
}

@Component({
  selector: 'app-project-chart',
  templateUrl: './project-chart.component.html',
  styleUrls: ['./project-chart.component.css']
})
export class ProjectChartComponent implements OnInit {
  @Input() project: Project;
  @Input() enableModal: boolean;

  title: string;
  data: ChartData[] = [];

  // view: any[] = [500, 400];
  view: any[] = [370, 275];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Date';
  showYAxisLabel = true;
  yAxisLabel = 'Dollars';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#CCCCCC', '#0756E4', '#987645', '#FF34589']
  };

  // line, area
  autoScale = true;

  constructor(private el: ElementRef) {
  }

  
  ngOnInit() {
    this.convertData();

    const height = this.el.nativeElement.parentElement.clientHeight;
    const width = this.el.nativeElement.parentElement.clientWidth;
     console.log('height: ', height, ' width: ', width);
   // this.view = [width, height];
    this.title = this.project.projectName;
  }


  // convert the monthly data to an array of cummulative data
  convertData() {
    const plannedCapitalSeries = new Array();
    const actualCapitalSeries = new Array();
    const capitalBudgetSeries = new Array();
    const plannedExpenseSeries = new Array();
    const actualExpenseSeries = new Array();
    const expenseBudgetSeries = new Array();



    const plannedStartDate = moment(this.project.startDate());
    let cumPlannedCap = 0;
    let cumActualCap = 0;
    let cumPlannedExp = 0;
    let cumActualExp = 0;

    let countActualCapMonths = 0;
    let countActualExpMonths = 0;

    for (const month of this.project.months) {

        const monthName = plannedStartDate.month(month.monthNo).format('YYYY-MM');
        cumPlannedCap += month.totalPlannedCapital;
        let rowData: SeriesData = {
          name: monthName,
          value: cumPlannedCap
        };
        plannedCapitalSeries.push(rowData);

        cumActualCap += month.totalActualCapital;

        rowData = {
          name: monthName,
          value: cumActualCap
        };
        actualCapitalSeries.push(rowData);
        if (month.totalActualCapital > 0 ) {
          countActualCapMonths = actualCapitalSeries.length;
        }


        rowData = {
          name: monthName,
          value: 50000
        };
        capitalBudgetSeries.push(rowData);

        cumPlannedExp += month.totalPlannedExpense;
        rowData = {
          name: monthName,
          value: cumPlannedExp
        };
        plannedExpenseSeries.push(rowData);

        cumActualExp += month.totalActualExpense;
        rowData = {
          name: monthName,
          value: cumActualExp
        };
        actualExpenseSeries.push(rowData);
        if (month.totalActualExpense > 0 ) {
          countActualExpMonths = actualExpenseSeries.length;
        }
        rowData = {
          name: monthName,
          value: 100000
        };
        expenseBudgetSeries.push(rowData);

    }

    let chartData: ChartData = {
      name: 'Planned Capital',
      series: plannedCapitalSeries
    };
    this.data.push(chartData);

    chartData = {
      name: 'Actual Capital',
      series: actualCapitalSeries
    };
    this.data.push(chartData);

    chartData = {
      name: 'Capital Budget',
      series: expenseBudgetSeries
    };

    this.data.push(chartData);

    chartData = {
      name: 'Planned Expense',
      series: plannedExpenseSeries
    };
    this.data.push(chartData);

    chartData = {
      name: 'Actual Expense',
      series: actualExpenseSeries
    };
    this.data.push(chartData);

    chartData = {
      name: 'Expense Budget',
      series: expenseBudgetSeries
    };
    this.data.push(chartData);

     // estimated at completion (EAC) uses all of the actual months
    // then continues with the planned months.
    const capEAC = new Array();
    const expEAC = new Array();

    let cumCapEAC = 0;
    let cumExpEAC = 0;

    const lastActualMonth = (countActualExpMonths >= countActualCapMonths) ? countActualExpMonths : countActualCapMonths;
    for (let i = 0; i < lastActualMonth; i++) {
      capEAC.push(actualCapitalSeries[i]);
      expEAC.push(actualExpenseSeries[i]);
    }
    cumCapEAC = actualCapitalSeries[lastActualMonth].value;
    cumExpEAC = actualExpenseSeries[lastActualMonth].value;

    for (let i = lastActualMonth; i < this.project.months.length; i++) {
        cumCapEAC += this.project.months[i].totalPlannedCapital;
        let rowData: SeriesData = {
          name: actualCapitalSeries[i].name,
          value: cumCapEAC
        };
        capEAC.push(rowData);

        cumExpEAC += this.project.months[i].totalPlannedExpense;
        rowData = {
          name: actualExpenseSeries[i].name,
          value: cumExpEAC
        };
        expEAC.push(rowData);
    }
    chartData = {
      name: 'Exp EAC',
      series: expEAC
    };
    this.data.push(chartData);

    chartData = {
      name: 'Cap EAC',
      series: capEAC
    };

    this.data.push(chartData);

    console.log(this.data);
  }
}
