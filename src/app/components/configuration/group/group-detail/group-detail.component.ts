import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { GroupService } from './../group.service';
import { Group, LoggedInUser, GroupBudget, BudgetType } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
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

  // handle the embedded budget form
  budgetForm: FormGroup;
  selectedBudget: GroupBudget;
  showBudgetForm = false;
  showConfirmDelete = false;

  error: any;
  opened = false;

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
    });

    this.setBudget(BudgetType.Capital, this.group.groupBudgets);
    this.setBudget(BudgetType.Expense, this.group.groupBudgets);
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
      parentId: ['', Validators.required],
      level: [{ value: 0, disabled: true }],
      levelDesc: '',
      groupName: ['', Validators.required],
      groupDesc: '',
      groupManager: '',
      capBudgets: this.fb.array([]),
      expBudgets: this.fb.array([])
    }
    );
  }

  setBudget(type: BudgetType, budgets: GroupBudget[]) {
    const budgetFGs = budgets.filter(budget => budget.budgetType === type)
      .map(budget => this.createBudget(budget));
    const budgetFormArray = this.fb.array(budgetFGs);

    if (type === BudgetType.Capital) {
      this.groupForm.setControl('capBudgets', budgetFormArray);
    } else {
      this.groupForm.setControl('expBudgets', budgetFormArray);
    }
  }

  createBudget(budget: GroupBudget) {
    return this.fb.group( {
        groupBudgetId: budget.groupBudgetId,
        budgetType: [budget.budgetType, Validators.required],
        budgetYear: [budget.budgetYear, Validators.required],
        approvedDateTime: [budget.approvedDateTime, Validators.required],
        amount: [budget.amount, Validators.required]
    });
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

  addBudget(type: BudgetType) {

    if (type === BudgetType.Capital) {
      const budgets = this.groupForm.get('capBudgets') as FormArray;
      budgets.push(this.createBudget(new GroupBudget()));
    } else {
      const budgets = this.groupForm.get('expBudgets') as FormArray;
      budgets.push(this.createBudget(new GroupBudget()));
    }

  }


  getBudgetFromFormValue(formValue: any): GroupBudget {
    let budget: GroupBudget;
    budget = new GroupBudget();

    budget.groupBudgetId = formValue.groupBudgetId;
    budget.groupId = formValue.groupId;
    budget.budgetType = formValue.budgetType;
    budget.approvedDateTime = formValue.approvedDateTime;
    budget.budgetYear = formValue.budgetYear;
    budget.amount = formValue.amount;
    return budget;
  }



  confirmDeleteBudget(budget: GroupBudget) {
    this.selectedBudget = budget;
    this.showConfirmDelete = true;
  }

  deleteBudget() {
    const budgetIndex = this.group.groupBudgets.findIndex(b => b.groupBudgetId === this.selectedBudget.groupBudgetId);
    if (budgetIndex) {
      this.group.groupBudgets.slice(budgetIndex, 1);
    }
    this.showConfirmDelete = false;
  }
}



