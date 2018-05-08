import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { GroupService } from '../../../../services';
import { Group, LoggedInUser, GroupBudget, BudgetType } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { invalidSelectValidator } from '../../../../directives/invalid-select.directive';

import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services';
import { ToastrService } from 'ngx-toastr';

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
  styleUrls: ['./group-detail.component.scss']
})
export class GroupDetailComponent implements OnInit, OnChanges {


  group: Group;
  pmList: LoggedInUser[];
  groupOptions: Group[];



  expBudget: number;
  capBudget: number;

  currentYear: number;
  groupForm: FormGroup;

  // handle the embedded budget form
  selectedBudget: any;
  showBudgetForm = false;
  showDeleteBudget = false;

  isLoading = false;

  error: any;


  constructor(private groupService: GroupService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toast: ToastrService

  ) {
    this.createForm();
  }

  ngOnInit() {
    this.getGroupList();
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

    if (group.groupId !== 0) {
      this.groupService.update(group.groupId, group).subscribe(data => {
        this.toast.success('Group has been updated', 'Success');
        this.router.navigate(['/configuration/groups']);
      },
        error => {this.toast.error(error, 'Oops');
          console.log(error); });
    } else {

      const newGroup: CreateGroup = {
        groupName: group.groupName,
        groupDesc: group.groupDesc,
        groupManager: group.groupManager,
        level: group.level,
        parentId: group.parentId,
        levelDesc: group.levelDesc
      };

      this.groupService.create(JSON.stringify(group)).subscribe(data => {
        // this.resetForm();
        this.group = data;
        this.toast.success('Group has been Added', 'Success');
        this.router.navigate(['/configuration/groups']);
      },
      error => {this.toast.error(error, 'Oops');
      console.log(error); });
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
    const capBudgets: GroupBudget[] = formValue.capBudgets.map(
      (budget: GroupBudget) => Object.assign({}, budget)
    );

    const expBudgets: GroupBudget[] = formValue.expBudgets.map(
      (budget: GroupBudget) => Object.assign({}, budget)
    );

    group.groupBudgets = capBudgets.concat(expBudgets);

    return group;

  }

  createForm() {
    this.groupForm = this.fb.group({
      groupId: '',
      parentId: ['', Validators.required, invalidSelectValidator()],
      level: [{ value: 0, disabled: true }],
      levelDesc: '',
      groupName: ['', Validators.required],
      groupDesc: '',
      groupManager: ['', Validators.required],
      capBudgets: this.fb.array([]),
      expBudgets: this.fb.array([])
    }
    );
  }

  get parentGroup() {
    return this.groupForm.get('parentId');
  }

  get groupName() {
    return this.groupForm.get('groupName');
  }

  get groupManager() {
    return this.groupForm.get('groupManager');
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
    let approvedDateTime = null;
    if (budget.approvedDateTime !== undefined) {
      approvedDateTime = moment(budget.approvedDateTime).format('YYYY-MM-DD');
    }
    return this.fb.group({
      groupBudgetId: budget.groupBudgetId,
      groupId: budget.groupId,
      budgetType: [budget.budgetType, Validators.required],
      budgetYear: [budget.budgetYear, Validators.required],
      approvedDateTime: [approvedDateTime, Validators.required],
      amount: [budget.amount, Validators.required]
    });
  }


  revert() { this.ngOnChanges(); }

  cancel() { this.router.navigate(['/configuration/groups']); }

  onChange(groupId: number) {
    this.groupOptions.forEach(g => {
      if (g.groupId = groupId) {
        this.groupForm.patchValue({ 'level': g.level + 1 });
      }
    });
  }


  getGroupList() {
    this.isLoading = true;
    this.groupService.getOptionList().subscribe(
      results => {
        this.groupOptions = results;
        this.getPMList();
      },
      error => this.error = error);
  }

  getPMList() {
    this.isLoading = true;
    // call the pm list and add the group manager name.
    this.userService.getUserInRoles('editPrograms').subscribe(
      res => {
        this.pmList = res;
        this.getGroup();
      },
      error => this.error = error
    );
  }

  getGroup() {
    this.isLoading = true;
    this.route.queryParams
      .filter(params => params.groupId)
      .subscribe(params => {
        const id = params.groupId;
        if (id === '-1') {
          this.group = new Group();
          this.group.groupId = 0;
          this.ngOnChanges();
          this.isLoading = false;
        } else {
          this.groupService.getOne(id).subscribe(
            results => {
              this.group = results;
              this.ngOnChanges();
              this.isLoading = false;
            },
            error => this.error = error
          );
        }
      });
  }
  addBudget(type: BudgetType) {
    const groupBudget = new GroupBudget();
    groupBudget.groupId = this.group.groupId;
    groupBudget.groupBudgetId = 0;

    if (type === BudgetType.Capital) {
      groupBudget.budgetType = BudgetType.Capital;
      const budgets = this.groupForm.get('capBudgets') as FormArray;
      budgets.push(this.createBudget(groupBudget));
    } else {
      groupBudget.budgetType = BudgetType.Expense;
      const budgets = this.groupForm.get('expBudgets') as FormArray;
      budgets.push(this.createBudget(groupBudget));
    }

  }



  confirmDeleteBudget(type: BudgetType, index: number) {
    this.selectedBudget = [type, index];
    this.showDeleteBudget = true;
  }

  removeBudget() {
    let budgets;
    if (this.selectedBudget[0] === BudgetType.Capital) {
      budgets = this.groupForm.get('capBudgets') as FormArray;
    } else {
      budgets = this.groupForm.get('expBudgets') as FormArray;
    }
    budgets.removeAt(this.selectedBudget[1]);
    this.showDeleteBudget = false;
  }
}



