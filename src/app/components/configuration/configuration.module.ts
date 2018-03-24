import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared.module';
import { GroupBudgetModule } from '../group-budget/group-budget.module';
import { routing } from './configuration.routing';
import { ClarityModule } from '@clr/angular';
import { HttpModule } from '@angular/http';

/* import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'; */


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
  GroupDetailComponent
} from '../configuration';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing,
    SharedModule,
    ReactiveFormsModule,
    GroupBudgetModule,
    ClarityModule,
    HttpModule
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
    GroupDetailComponent
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
