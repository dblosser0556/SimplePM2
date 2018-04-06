import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { SharedModule } from '../../modules/shared.module';
import { ProjectModule } from '../project/project.module';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';
import { dashboardRouting } from './dashboard.routing';
import { AuthGuard } from '../../guard/auth.guard';


import {HomeComponent,
  DivisionsComponent,
  TreeNodeComponent,
  ProgramsComponent,
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
    ReactiveFormsModule,
    ClarityModule,
    BreadcrumbsModule
  ],
  declarations: [ HomeComponent,
    DivisionsComponent,
    TreeNodeComponent,
    ProgramsComponent,
    ProjectsComponent,
    RootComponent,
    ],
  providers: [AuthGuard ]
})
export class DashboardModule { }
