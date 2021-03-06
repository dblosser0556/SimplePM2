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

import { ProjectService, VendorService, VendorInvoiceService, MilestoneService, ChartHelperService} from '../../services';

import { ProjectCardMonthlySummaryComponent } from './project-card-monthly-summary/project-card-monthly-summary.component';
import { VendorComponent } from './vendor/vendor.component';
import { VendorCardComponent } from './vendor/vendor-card/vendor-card.component';
import { VendorContractDetailsComponent } from './vendor/vendor-contract-details/vendor-contract-details.component';
import { VendorForecastComponent } from './vendor/vendor-forecast/vendor-forecast.component';
import { ProjectMilestonesComponent } from './project-milestones/project-milestones.component';

import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ProjectMilestoneChartComponent } from './project-milestone-chart/project-milestone-chart.component';
import { MilestoneChartComponent } from '../milestone-chart/milestone-chart.component';
import { ProjectDetailByMonthComponent } from './project-detail-by-month/project-detail-by-month.component';
import { CommandButtonComponent } from './project-detail-by-month/command-button.component';

import { ContextMenuModule } from 'ngx-contextmenu';

@NgModule({
  imports:      [CommonModule, FormsModule, ReactiveFormsModule,
    SharedModule, ContextMenuModule.forRoot(), BrowserAnimationsModule, NgxChartsModule, ClarityModule, ToastrModule.forRoot({timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true
    })  ],
  declarations: [
    ProjectComponent,
    ProjectDetailComponent,
    ProjectMonthlyDetailComponent,
    ProjectCardComponent,
    ProjectCardSummaryComponent,
    ProjectChartComponent,
    CommandMenuComponent,
    ProjectCardMonthlySummaryComponent,
    VendorComponent,
    VendorCardComponent,
    VendorContractDetailsComponent,
    VendorForecastComponent,
    ProjectMilestonesComponent,
    ProjectMilestoneChartComponent,
    MilestoneChartComponent,
    ProjectDetailByMonthComponent,
    CommandButtonComponent
    ],

  exports:      [
    ProjectComponent,
    ProjectDetailComponent,
    ProjectMonthlyDetailComponent,
    ProjectCardComponent,
    ProjectCardSummaryComponent,
    ProjectChartComponent,
    ProjectDetailByMonthComponent

  ],
      providers:    [ProjectService, VendorService, VendorInvoiceService,
        MilestoneService, ChartHelperService, CurrencyPipe, DecimalPipe]
})
export class ProjectModule { }
