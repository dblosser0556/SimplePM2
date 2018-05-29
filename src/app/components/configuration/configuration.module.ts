import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared.module';
import { configurationRouting } from './configuration.routing';
import { ClarityModule } from '@clr/angular';
import { HttpModule } from '@angular/http';
import { ProjectModule } from '../project/project.module';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';
import { UserService, GroupService, PhaseService, ResourceTypeService,
  StatusService, FixedPriceTypeService, RoleService, CharacteristicService } from '../../services';


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
  CharacteristicComponent,
  CharacteristicDetailComponent,
  ProjectConfigComponent
} from '../configuration';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    configurationRouting,
    SharedModule,
    ReactiveFormsModule,
    ClarityModule,
    HttpModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    ProjectModule,
    BreadcrumbsModule
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
    ProjectConfigComponent,
    CharacteristicComponent,
    CharacteristicDetailComponent
  ],
  providers: [
    PhaseService,
    FixedPriceTypeService,
    RoleService,
    StatusService,
    ResourceTypeService,
    GroupService,
    CharacteristicService]
})
export class ConfigurationModule { }
