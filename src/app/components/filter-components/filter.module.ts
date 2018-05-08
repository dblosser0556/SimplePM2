import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { GroupService, StatusService } from '../../services';




import {
  TreeNodeComponent,
  GroupFilterComponent,
  StatusFilterComponent,
  YearFilterComponent

 } from '../filter-components';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClarityModule,

  ],
  declarations: [
    TreeNodeComponent,
    GroupFilterComponent,
    StatusFilterComponent,
    YearFilterComponent
    ],
  exports:      [TreeNodeComponent, GroupFilterComponent, StatusFilterComponent, YearFilterComponent],
  providers: [StatusService, GroupService]
})
export class FilterModule { }
