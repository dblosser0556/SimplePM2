import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Project } from '../../../models';

@Component({
  selector: 'app-project-card-modal',
  templateUrl: './project-card-modal.component.html',
  styleUrls: ['./project-card-modal.component.css']
})
export class ProjectCardModalComponent implements OnInit {
  @Input() data: any;
  @Input() title: string;
  clickEnabled = false;
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

  constructor(private el: ElementRef) { }

  ngOnInit() {
    const height = this.el.nativeElement.parentElement.clientHeight;
    const width = this.el.nativeElement.parentElement.clientWidth;
     console.log('height: ', height, ' width: ', width);
    this.view = [750, 500];
  }
}
