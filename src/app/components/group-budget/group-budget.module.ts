import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { GroupBudgetComponent } from './group-budget.component';
import { GroupBudgetFilterPipe } from '../../filter/group-budget.filter';
import { SharedModule } from '../../modules/shared.module';
import { GroupBudgetService } from '../../services';

@NgModule({
  imports:      [CommonModule, FormsModule, ReactiveFormsModule,  BrowserAnimationsModule, HttpModule],
  declarations: [
    GroupBudgetComponent,
    GroupBudgetFilterPipe
  ],
    entryComponents: [GroupBudgetComponent],
    exports: [
      GroupBudgetComponent,
      GroupBudgetFilterPipe
    ],
    providers: [GroupBudgetService]
})
export class GroupBudgetModule { }
