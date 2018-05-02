
import { Component, OnInit, Input, OnChanges, Output, EventEmitter, QueryList, AfterContentInit } from '@angular/core';
import { ProjectService, } from '../../../services';
import { Project, Status, Group, Role, LoggedInUser, BudgetType, Budget, ProjectList, FixedPrice, FixedPriceMonth } from '../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { invalidSelectValidator } from '../../../directives/invalid-select.directive';
import * as moment from 'moment';
import { of } from 'rxjs/observable/of';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


interface CreateProject {
  isTemplate: boolean;
  projectName: string;
  projectDesc: string;
  projectManager: string;
  plannedStartDate: string;
  actualStartDate: string;
  groupId: number;
  statusId: number;
}

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnChanges {

  hasStartDateError: boolean;
  hasStatusError: boolean;
  hasStartError: boolean;
  hasStartDate: boolean;

  @Input() project: Project;
  @Input() statusList: Status[];
  @Input() groupList: Group[];
  @Input() pmList: LoggedInUser[];
  @Input() createTemplate: boolean;
  @Input() templateList: ProjectList[];
  @Input() selectedView: string;

  @Output() projectChange = new EventEmitter<Project>();

  showDeleteBudget = false;
  showDeleteMonths = false;
  isLoading = false;

  selectedBudget: any;

  projectForm: FormGroup;
  error: any;



  constructor(private projectService: ProjectService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private router: Router) {
    this.isLoading = true;
    this.createForm();
  }

  ngOnInit() {

  }

  ngOnChanges() {

    if (this.project === undefined || this.statusList === undefined ||
      this.groupList === undefined || this.pmList === undefined ||
      this.createTemplate === undefined || this.selectedView === undefined) {
      console.log('something Undefined');
      return;
    }

    let plannedStartDate = moment().format('MM/DD/YYYY');
    if (this.project.plannedStartDate !== null) {
      plannedStartDate = moment(this.project.plannedStartDate).format('MM/DD/YYYY');
    }
    let actualStartDate = null;
    if (this.project.actualStartDate !== null) {
      actualStartDate = moment(this.project.actualStartDate).format('MM/DD/YYYY');
    }
    this.projectForm.reset({
      projectID: this.project.projectId,

      // always set the value to the passed in value.
      isTemplate: this.createTemplate,

      projectName: this.project.projectName,
      projectDesc: this.project.projectDesc,
      projectManager: this.project.projectManager,
      plannedStartDate: plannedStartDate,
      actualStartDate: actualStartDate,
      groupId: this.project.groupId,
      statusId: this.project.statusId,
      templateId: -1,

    });
    this.setBudget(BudgetType.Capital, this.project.budgets);
    this.setBudget(BudgetType.Expense, this.project.budgets);
    this.checkErrors();

    // maintain the warnings as the form changes.
    this.projectForm.get('actualStartDate').valueChanges.subscribe(val => this.checkErrors());

    this.projectForm.get('plannedStartDate').valueChanges.subscribe(val => this.checkErrors());

    this.projectForm.get('statusId').valueChanges.subscribe(val => this.checkErrors());

    this.isLoading = false;
  }

  checkErrors() {
    // set up all of the warning flags.

    if (this.projectForm.get('actualStartDate').value !== null) {
      this.hasStartDate = true;
    } else {
      this.hasStartDate = false;
    }

    const today = moment();
    if (!this.hasStartDate && moment(this.projectForm.get('plannedStartDate').value).isBefore(today)) {
      this.hasStartError = true;
    } else {
      this.hasStartError = false;
    }
    console.log('statusID', this.projectForm.get('statusId').value);
    console.log('statusList ', this.statusList);
    const statusType: Status = this.statusList.find(s => s.statusId === Number(this.projectForm.get('statusId').value));
    console.log('status tupe', statusType);
    if (this.hasStartDate && !statusType.dashboard) {
      this.hasStartDateError = true;
    } else {
      this.hasStartDateError = false;
    }

    if (!this.hasStartDate && statusType.dashboard) {
      this.hasStatusError = true;
    } else {
      this.hasStatusError = false;
    }
  }

  onSubmit() {
    this.projectForm.updateValueAndValidity();
    if (this.projectForm.invalid) {
      return;
    }

    const project: Project = this.getProjectFromFormValue(this.projectForm.value);
    if (project.projectId !== null) {
      this.projectService.update(project.projectId, project).subscribe(data => {
        this.project = data;
        this.toast.success('Project Details successfully updated.', 'Success');
        this.projectChange.emit(this.project);
        this.ngOnChanges();
      },
        error => {
          this.toast.error(error, 'Oops! Something went wrong');
          console.log(error);
        });
    } else {
      const newProject: CreateProject = {
        projectName: project.projectName,
        isTemplate: project.isTemplate,
        projectDesc: project.projectDesc,
        projectManager: project.projectManager,
        plannedStartDate: project.plannedStartDate,
        actualStartDate: project.actualStartDate,
        groupId: project.groupId,
        statusId: project.statusId
      };

      this.projectService.create(JSON.stringify(newProject)).subscribe(data => {
        // this.resetForm();
        this.project = data;
        this.toast.success('Project successfully added.', 'Success');
        this.projectChange.emit(this.project);
        this.ngOnChanges();
      },
        error => {
          this.toast.error(error, 'Oops! Something went wrong');
          console.log(error);
        });
    }
  }


  getProjectFromFormValue(formValue: any): Project {
    const project = new Project();
    project.projectId = formValue.projectID;
    project.isTemplate = formValue.isTemplate;
    project.projectName = formValue.projectName;
    project.projectDesc = formValue.projectDesc;
    project.projectManager = formValue.projectManager;

    // the date picker return an instance of date so convert it back to string.
    const plannedStartDate = moment(formValue.plannedStartDate);
    project.plannedStartDate = plannedStartDate.format('YYYY-MM-DD');
    if (formValue.actualStartDate) {
      const actualStartDate = moment(formValue.actualStartDate);
      project.actualStartDate = actualStartDate.format('YYYY-MM-DD');
    } else {
      project.actualStartDate = null;
    }
    project.groupId = formValue.groupId;
    project.statusId = formValue.statusId;

    const capBudgets: Budget[] = formValue.capBudgets.map(
      (budget: Budget) => Object.assign({}, budget)
    );

    const expBudgets: Budget[] = formValue.expBudgets.map(
      (budget: Budget) => Object.assign({}, budget)
    );

    project.budgets = capBudgets.concat(expBudgets);

    // add all the remaining pieces from the passed project.
    if (this.project.milestones !== null) {
      project.milestones = this.project.milestones;
    }

    if (this.project.vendors !== null) {
      project.vendors = this.project.vendors;
    }
    if (this.project.months !== null) {
      project.months = this.project.months;
    }
    if (this.project.resources !== null) {
      project.resources = this.project.resources;
    }

    if (this.project.fixedPriceCosts !== null) {
      project.fixedPriceCosts = this.project.fixedPriceCosts;
    }

    return project;

  }

  createForm() {
    this.projectForm = this.fb.group({
      projectID: '',
      projectName: ['', Validators.required],
      isTemplate: this.createTemplate,
      projectDesc: '',
      projectManager: ['', Validators.required, invalidSelectValidator()],
      plannedStartDate: '',
      actualStartDate: '',
      groupId: ['', Validators.required, invalidSelectValidator()],
      statusId: ['', Validators.required, invalidSelectValidator()],
      templateId: '',
      capBudgets: this.fb.array([]),
      expBudgets: this.fb.array([])
    }
    );
  }

  // sort cuts for validation logic
  get projectName() {
    return this.projectForm.get('projectName');
  }

  get projectGroup() {
    return this.projectForm.get('groupId');
  }

  get projectManager() {
    return this.projectForm.get('projectManager');
  }

  get projectStatus() {
    return this.projectForm.get('statusId');
  }

  get plannedStartDate() {
    return this.projectForm.get('plannedStartDate');
  }



  setBudget(type: BudgetType, budgets: Budget[]) {
    const budgetFGs = budgets.filter(budget => budget.budgetType === type)
      .map(budget => this.createBudget(budget));
    const budgetFormArray = this.fb.array(budgetFGs);

    if (type === BudgetType.Capital) {
      this.projectForm.setControl('capBudgets', budgetFormArray);
    } else {
      this.projectForm.setControl('expBudgets', budgetFormArray);
    }
  }


  createBudget(budget: Budget) {
    let approvedDateTime = null;
    if (budget.approvedDateTime !== undefined) {
      approvedDateTime = moment(budget.approvedDateTime).format('YYYY-MM-DD');
    }
    return this.fb.group({
      budgetId: budget.budgetId,
      projectId: budget.projectId,
      budgetType: [budget.budgetType, Validators.required],
      approvedDateTime: [approvedDateTime, Validators.required],
      amount: [budget.amount, Validators.required],
      accountingIdentifier: budget.accountingIdentifier,
      comments: budget.comments

    });
  }

  confirmDelete() {
    this.showDeleteMonths = true;
  }
  removePeriods() {
    this.project.fixedPriceCosts = [];
    this.project.resources = [];
  }

  selectTemplate(templateId: number) {
    let template = new Project();
    // make sure we are on a valid template.
    if (templateId === -1) {
      this.toast.info('Please select a valid template');
      return;
    }

    // get the template data
    this.projectService.getOne(templateId).subscribe(
      results => {

        template = results;
        console.log('template:', template);
        if (template.months !== undefined) {
          this.project.months = template.months;
          this.project.fixedPriceCosts = template.fixedPriceCosts;
          this.project.resources = template.resources;
        }
        console.log('project', this.project);

        this.toast.success('Successfully Applied Template');
      },
      error => {
        this.toast.error(error, 'Oops! Something went wrong');
        console.log(error);
      });

  }



  revert() { this.ngOnChanges(); }

  cancel() { this.router.navigate(['/configuration/projects']); }


  addBudget(type: BudgetType) {
    const budget = new Budget();
    budget.budgetId = 0;
    budget.projectId = this.project.projectId;
    if (type === BudgetType.Capital) {
      const budgets = this.projectForm.get('capBudgets') as FormArray;
      budget.budgetType = BudgetType.Capital;
      budgets.push(this.createBudget(budget));
    } else {
      const budgets = this.projectForm.get('expBudgets') as FormArray;
      budget.budgetType = BudgetType.Expense;
      budgets.push(this.createBudget(budget));
    }

  }

  confirmDeleteBudget(type: BudgetType, index: number) {
    this.selectedBudget = [type, index];
    this.showDeleteBudget = true;
  }

  removeBudget() {
    let budgets;
    if (this.selectedBudget[0] === BudgetType.Capital) {
      budgets = this.projectForm.get('capBudgets') as FormArray;
    } else {
      budgets = this.projectForm.get('expBudgets') as FormArray;
    }
    budgets.removeAt(this.selectedBudget[1]);
    this.showDeleteBudget = false;
  }
}
