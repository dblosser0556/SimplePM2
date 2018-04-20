import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { SharedModule } from '../../modules/shared.module';
import { ProjectModule } from '../project/project.module';
import { FilterModule } from '../filter-components/filter.module';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';
import { dashboardRouting } from './dashboard.routing';
import { AuthGuard } from '../../guard/auth.guard';
import { ProjectMonthlyProjectionService, ChartHelperService } from '../../services';
import { NgxChartsModule } from '@swimlane/ngx-charts';


import {HomeComponent,
  DivisionsComponent,
  ProjectsComponent,
  RootComponent
 } from '../dashboard';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    dashboardRouting,
    SharedModule,
    ProjectModule,
    FilterModule,
    ReactiveFormsModule,
    ClarityModule,
    BreadcrumbsModule,
    NgxChartsModule

  ],
  declarations: [ HomeComponent,
    DivisionsComponent,
    ProjectsComponent,
    RootComponent,
    ],
  providers: [AuthGuard, ProjectMonthlyProjectionService, ChartHelperService ]
})
export class DashboardModule { }
