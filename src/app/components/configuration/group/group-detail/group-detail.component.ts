import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { GroupService } from './../group.service';
import { Group, LoggedInUser, GroupBudget, BudgetType } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { GroupBudgetComponent } from '../../../group-budget/group-budget.component';

import * as moment from 'moment';

interface CreateGroup {
  groupName: string;
  groupDesc: string;
  groupManager: string;
  parentId: number;
  level: number;
  levelDesc: string;
}



@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit, OnChanges {


  @Input() group: Group;
  @Input() pmList: LoggedInUser[];
  @Input() groupOptions: Group[];
  @Output() groupChange = new EventEmitter<Group>();

//  public budgetListModal: BsModalRef;
//  public budgetDetailModal: BsModalRef;

  expBudget: number;
  capBudget: number;

  currentYear: number;
  groupForm: FormGroup;
  error: any;

  constructor(private groupService: GroupService,
    private fb: FormBuilder,
  //  private modalService: BsModalService
  ) {
    this.createForm();
  }

  ngOnInit() {

  }

  ngOnChanges() {
    this.currentYear = moment().year();
    this.expBudget = 0;
    this.capBudget = 0;
    if (this.group.groupBudgets !== undefined) {
      for (const budget of this.group.groupBudgets) {
        if (budget.budgetYear === this.currentYear) {
          if (budget.budgetType === BudgetType.Capital) {

            this.capBudget += budget.amount;
          } else {
            this.expBudget += budget.amount;
          }
        }
      }
    }
    if (this.group.level === undefined) {
      this.group.level = 0;
    }
    this.groupForm.reset({
      groupId: this.group.groupId,
      groupName: this.group.groupName,
      groupDesc: this.group.groupDesc,
      groupManager: this.group.groupManager,
      parentId: this.group.parentId,
      levelDesc: this.group.levelDesc,
      level: this.group.level,
      capBudget: this.capBudget,
      expBudget: this.expBudget
    });
  }

  onSubmit() {
    this.groupForm.updateValueAndValidity();
    if (this.groupForm.invalid) {
      return;
    }

    const group: Group = this.getGroupFromFormValue(this.groupForm.value);
    if (group.groupId !== null && group.groupId !== undefined) {
      this.groupService.update(group.groupId, group).subscribe(data => {
        // this.snackBar.open('Project Cost Type has been updated', '', {duration: 2000});
        this.groupChange.emit(group);
      },
        error => this.error = error);
    } else {
      const newGroup: CreateGroup = {
        groupName: group.groupName,
        groupDesc: group.groupDesc,
        groupManager: group.groupManager,
        level: group.level,
        parentId: group.parentId,
        levelDesc: group.levelDesc
      };

      this.groupService.create(JSON.stringify(newGroup)).subscribe(data => {
        // this.resetForm();
        this.group = data;
        // this.snackBar.open('Project Cost Type has been Added', '', { duration: 2000 });
        this.groupChange.emit(group);
      },
        error => this.error = error);
    }
  }


  getGroupFromFormValue(formValue: any): Group {
    let group: Group;
    group = new Group();

    group.groupId = formValue.groupId;
    group.groupName = formValue.groupName;
    group.groupDesc = formValue.groupDesc;
    group.parentId = formValue.parentId;
    group.levelDesc = formValue.levelDesc;
    group.groupManager = formValue.groupManager;
    group.level = formValue.level;
    return group;

  }

  createForm() {
    this.groupForm = this.fb.group({
      groupId: '',
      parentId: '',
      level: [{ value: 0, disabled: true }],
      levelDesc: '',
      groupName: ['', Validators.required],
      groupDesc: '',
      groupManager: '',
      capBudget: '',
      expBudget: ''

    }
    );
  }


  revert() { this.ngOnChanges(); }

  cancel() { this.groupChange.emit(this.group); }

  onChange(groupId: number) {
    this.groupOptions.forEach(g => {
      if (g.groupId = groupId) {
        this.groupForm.patchValue({ 'level': g.level + 1 });
      }
    });
  }

  showBudget(isCapital: boolean) {
    let _budgets = new Array<GroupBudget>();
    if (this.group.groupBudgets !== undefined) {
      _budgets = this.group.groupBudgets;
    }

    const initialState = {
      budgets: _budgets,
      groupId: this.group.groupId,
      title: this.group.groupName,
      isCapital: isCapital
    };

//    this.budgetListModal = this.modalService.show(GroupBudgetComponent, { initialState });
//    this.budgetListModal.content.onClose.subscribe(result => {
////      console.log('results', result);
//      this.group.groupBudgets = result;
//      this.ngOnChanges();
//    });
  }

 /*  addBudget(isCapital: boolean) {
    const _budget = new GroupBudget();
    _budget.groupBudgetId = null;
    _budget.groupId = this.group.groupId;
    _budget.budgetType = (isCapital) ? BudgetType.Capital : BudgetType.Expense;
    const initialState = {
      budget: _budget
    };
    this.budgetDetailModal = this.modalService.show(GroupBudgetDetailComponent, { initialState });
    this.budgetDetailModal.content.onClose.subscribe(result => {
      console.log('results', result);
      this.group.groupBudgets.push(result);
      this.ngOnChanges();
    });
  } */

}
