import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {configurationRouting } from '../configuration/configuration.routing';
import { dashboardRouting } from '../dashboard/dashboard.routing';

import { BreadcrumbsComponent } from './breadcrumbs.component';




@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, dashboardRouting, configurationRouting
  ],
  declarations: [BreadcrumbsComponent],
  exports: [BreadcrumbsComponent]
})
export class BreadcrumbsModule { }
