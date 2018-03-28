import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '../../modules/shared.module';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectMonthlyDetailComponent } from './project-monthly-detail/project-monthly-detail.component';
import { CommandMenuComponent} from './project-monthly-detail/command-menu-component';
import { ProjectComponent } from './project.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { ProjectCardSummaryComponent } from './project-card-summary/project-card-summary.component';
import { ProjectChartComponent } from './project-chart/project-chart.component';

import { ProjectService} from '../../services';

import { ProjectCardMonthlySummaryComponent } from './project-card-monthly-summary/project-card-monthly-summary.component';




@NgModule({
  imports:      [CommonModule, FormsModule, ReactiveFormsModule,
    SharedModule, BrowserAnimationsModule, NgxChartsModule, ClarityModule, ToastrModule.forRoot()  ],
  declarations: [
    ProjectComponent,
    ProjectDetailComponent,
    ProjectMonthlyDetailComponent,
    ProjectCardComponent,
    ProjectCardSummaryComponent,
    ProjectChartComponent,
    CommandMenuComponent,
    ProjectCardMonthlySummaryComponent],
   
  exports:      [
    ProjectComponent,
    ProjectDetailComponent,
    ProjectMonthlyDetailComponent,
    ProjectCardComponent,
    ProjectCardSummaryComponent,
    ProjectChartComponent
  ],
      providers:    [ProjectService]
})
export class ProjectModule { }