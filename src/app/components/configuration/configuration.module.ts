import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared.module';
import { routing } from './configuration.routing';
import { ClarityModule } from '@clr/angular';
import { HttpModule } from '@angular/http';
import { ProjectModule } from '../project/project.module';

import { FixedPriceTypeService } from './fixed-price-type/fixed-price-type.service';
import { RoleService } from './role/role.service';
import { StatusService } from './status/status.service';
import { GroupService } from './group/group.service';
import { ResourceTypeService } from './resource-type/resource-type.service';
import { PhaseService } from './phase/phase.service';
import { UserService } from '../../services';


import {
  RootComponent,
  PhaseListComponent,
  PhaseDetailComponent,
  StatusComponent,
  ResourceTypeComponent,
  RoleComponent,
  FixedPriceTypeComponent,
  FixedPriceTypeDetailComponent,
  RoleDetailComponent,
  StatusDetailComponent,
  ResourceTypeDetailComponent,
  AccountListComponent,
  RegistrationFormComponent,
  GroupComponent,
  GroupDetailComponent,
  ProjectConfigComponent
} from '../configuration';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing,
    SharedModule,
    ReactiveFormsModule,
    ClarityModule,
    HttpModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    ProjectModule
  ],
  declarations: [
    RootComponent,
    PhaseListComponent,
    PhaseDetailComponent,
    StatusComponent,
    ResourceTypeComponent,
    RoleComponent,
    FixedPriceTypeComponent,
    FixedPriceTypeDetailComponent,
    RoleDetailComponent,
    StatusDetailComponent,
    ResourceTypeDetailComponent,
    GroupComponent,
    AccountListComponent,
    RegistrationFormComponent,
    GroupDetailComponent,
    BreadcrumbsComponent,
    ProjectConfigComponent
  ],
  providers: [
    PhaseService,
    FixedPriceTypeService,
    RoleService,
    StatusService,
    ResourceTypeService,
    GroupService]
})
export class ConfigurationModule { }
