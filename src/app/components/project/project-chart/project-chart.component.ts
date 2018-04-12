import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import { Project, BudgetType, ChartData } from '../../../models';
import { ChartHelperService } from '../../../services';
import * as moment from 'moment';



@Component({
  selector: 'app-project-chart',
  templateUrl: './project-chart.component.html',
  styleUrls: ['./project-chart.component.css']
})
export class ProjectChartComponent implements OnInit {
  @Input() project: Project;
  @Input() enableModal: Boolean;
  viewCapValues = true;
  viewExpValues = true;
  viewEnlargedChartModal = false;
  projectStartDate: string;

  title: string;
  data: ChartData[] = [];

  // view: any[] = [500, 400];
  view: any[] = [];

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

  constructor(private el: ElementRef,
    private chartHelper: ChartHelperService) {
  }

  showCapChart() {
    this.viewCapValues = !this.viewCapValues;
    this.convertData();
  }

  showExpChart() {
    this.viewExpValues = !this.viewExpValues;
    this.convertData();
  }

  showEnlargedChart() {
    this.viewEnlargedChartModal = true;
  }

  ngOnInit() {
    this.projectStartDate = moment(this.project.startDate()).format('MM/DD/YYYY');
    this.convertData();

    const height = this.el.nativeElement.parentElement.clientHeight;
    const width = this.el.nativeElement.parentElement.clientWidth;
    console.log('height: ', height, ' width: ', width);
    this.view = [width - 30, height];
    this.title = this.project.projectName;
  }

  convertData() {
    this.data = this.chartHelper.convertData(this.project.months,
       this.viewCapValues, this.viewExpValues,
      this.projectStartDate, this.project.budgets);
  }

 
}
