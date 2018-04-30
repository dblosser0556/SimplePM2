import { Component, OnInit, Input, OnChanges, HostListener, ElementRef,
  AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import {
  Project, Resource, Month, ResourceMonth, Phase,
  ResourceType, FixedPriceType, Role, FixedPrice, FixedPriceMonth, MenuItem, Budget
} from '../../../models';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ToastrService } from 'ngx-toastr';
import { ProjectService, ConfigService } from '../../../services';
import { UtilityService } from '../../../services/utility.service';
import { Subject } from 'rxjs/Subject';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-detail-by-month',
  templateUrl: './project-detail-by-month.component.html',
  styleUrls: ['./project-detail-by-month.component.scss']
})
export class ProjectDetailByMonthComponent implements OnInit, OnChanges, AfterViewInit {


  resourceRowFG: FormGroup;
  fixedPriceRowFG: FormGroup;
  canPastefixedPriceRow: boolean;
  canPasteMonthRow: boolean;
  canPasteFixFeeRow: boolean;
  canPasteResourceRow: boolean;
  menuItems: MenuItem[];
  selectedCells: any;
  showPaginator: boolean;
  isLoading: boolean;
  rowMenulinks: any;
  private _project = new BehaviorSubject<Project>(undefined);

  @Input() set project(value: Project) {
    this._project.next(value);
  }

  get project() {
    return this._project.getValue();
  }
  @Input() selectedView: any;

  @Output() projectChange = new EventEmitter<Project>();
  // set up the context menus.
  @ViewChild('resourceMenu') public resourceMenu: ContextMenuComponent;
  @ViewChild('fixedMenu') public fixedMenu: ContextMenuComponent;
  @ViewChild('projectMonthMenu') public projectMonthMenu: ContextMenuComponent;


  projectForm: FormGroup;

  phaseList: Phase[] = [];
  resourceTypeList: ResourceType[] = [];
  fixedPriceTypeList: FixedPriceType[] = [];
  roleList: Role[] = [];

  fcol = 0;
  lcol = 0;
  pageSize = 5;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calcPageSize();
  }

  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    private projectService: ProjectService,
    private util: UtilityService,
    private el: ElementRef,
    private config: ConfigService,
    private router: Router,
    private route: ActivatedRoute) {

    this.isLoading = true;

    // get the various drop down lists.
    this.phaseList = this.util.getPhaseList();
    this.fixedPriceTypeList = this.util.getFixedPriceTypeList();
    this.resourceTypeList = this.util.getResourceTypeList();
    this.roleList = this.util.getRoles();
    this.menuItems = this.config.capWeightConfig;


    // create the form.
    this.createForm();
  }

  ngOnInit() {
    this.isLoading = true;

    // The Project data is provided asyncronously by
    // the parent component.  The data is not available on init.
    // So we need to subscribe to changes to the data to keep from
    // logging many errors.
    this._project.subscribe(x => {

      // if this is the first time through create the hierarchy,
      // else just make updates.
      if (x !== undefined) {
        this.lcol = 5;
        this.onChanges();
        this.calcPageSize();
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    // this.calcPageSize();
  }

  ngOnChanges() {
    if (this.project === undefined) {
      return;
    }


    this.projectForm.reset({
      projectID: this.project.projectId
    });
    this.setMonthRows(this.project.months);
    this.setResourceRows(this.project.resources);
    this.setFixedRows(this.project.fixedPriceCosts);



  }

  createForm() {
    this.projectForm = this.fb.group({
      projectId: '',
      projectMonths: this.fb.array([]),
      resourceRows: this.fb.array([]),
      fixedRows: this.fb.array([])
    });

  }

  onChanges() {
    // subscribe to changes to the fixed rows and update the totals.
    this.projectForm.get('resourceRows').valueChanges.pipe(debounceTime(400)).subscribe(val => {
      val.forEach((resource: Resource) => {
        let totalPlannedEffort = 0;
        let totalActualEffort = 0;

        // add up the hours
        resource.resourceMonths.forEach(month => {
          totalPlannedEffort += month.plannedEffort;
          totalActualEffort += month.actualEffort;
        });

        // update the fields.
        const resourceFA = this.projectForm.get('resourceRows') as FormArray;
        const resourceFG = resourceFA.controls.find(f => f.get('resourceId').value === resource.resourceId) as FormGroup;
        resourceFG.get('totalPlannedEffort').setValue(totalPlannedEffort);
        resourceFG.get('totalActualEffort').setValue(totalActualEffort);
      });

      this.updateMonthlyTotals();
    });


    // subscribe to changes to the fixed rows and update the totals.
    this.projectForm.get('fixedRows').valueChanges.pipe(debounceTime(400)).subscribe(val => {
      val.forEach((fixedPrice: FixedPrice) => {
        let totalPlannedCost = 0;
        let totalActualCost = 0;
        fixedPrice.fixedPriceMonths.forEach(month => {
          totalPlannedCost += month.plannedCost;
          totalActualCost += month.actualCost;
        });


        const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;
        const fixedPriceFG = fixedPriceFA.controls.find(f => f.get('fixedPriceId').value === fixedPrice.fixedPriceId) as FormGroup;
        fixedPriceFG.get('totalPlannedCost').setValue(totalPlannedCost);
        fixedPriceFG.get('totalActualCost').setValue(totalActualCost);
      });
      this.updateMonthlyTotals();
    });

  }

  // when the monthly values change ensure the monthly totals are updated.
  updateMonthlyTotals() {
    // get a reference to the various arrays.
    const monthsFA = this.projectForm.get('projectMonths') as FormArray;
    const resourceFA = this.projectForm.get('resourceRows') as FormArray;
    const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;

    monthsFA.controls.forEach((month, index) => {
      let totalActualCapital = 0;
      let totalActualExpense = 0;
      let totalPlannedCapital = 0;
      let totalPlannedExpense = 0;

      resourceFA.controls.forEach(resource => {
        const resourceMonths = resource.get('resourceMonths') as FormArray;
        if (this.selectedView === 'Forecast') {
          totalPlannedCapital += resourceMonths.controls[index].get('plannedEffort').value * resource.get('rate').value
            * resourceMonths.controls[index].get('plannedEffortCapPercent').value;
          totalPlannedExpense += resourceMonths.controls[index].get('plannedEffort').value * resource.get('rate').value
            * (1 - resourceMonths.controls[index].get('plannedEffortCapPercent').value);
        } else {
          totalActualCapital += resourceMonths.controls[index].get('actualEffort').value * resource.get('rate').value
            * resourceMonths.controls[index].get('actualEffortCapPercent').value;
          totalActualExpense += resourceMonths.controls[index].get('actualEffort').value * resource.get('rate').value
            * (1 - resourceMonths.controls[index].get('actualEffortCapPercent').value);
        }

      });

      fixedPriceFA.controls.forEach(fixedPrice => {
        const fixedPriceMonths = fixedPrice.get('fixedPriceMonths') as FormArray;
        if (this.selectedView === 'Forecast') {
          totalPlannedCapital += fixedPriceMonths.controls[index].get('plannedCost').value
            * fixedPriceMonths.controls[index].get('plannedCostCapPercent').value;
          totalPlannedExpense += fixedPriceMonths.controls[index].get('plannedCost').value
            * (1 - fixedPriceMonths.controls[index].get('plannedCostCapPercent').value);
        } else {
          totalActualCapital += fixedPriceMonths.controls[index].get('actualCost').value
            * fixedPriceMonths.controls[index].get('actualCostCapPercent').value;
          totalActualExpense += fixedPriceMonths.controls[index].get('actualCost').value
            * (1 - fixedPriceMonths.controls[index].get('actualCostCapPercent').value);
        }

      });

      if (this.selectedView === 'Forecast') {
        month.get('totalPlannedCapital').setValue(totalPlannedCapital);
        month.get('totalPlannedExpense').setValue(totalPlannedExpense);
      } else {
        month.get('totalActualCapital').setValue(totalActualCapital);
        month.get('totalActualExpense').setValue(totalActualExpense);
      }
    });
  }
  setMonthRows(months: Month[]) {
    const monthFGs = months.map(
      month => this.createMonth(month));
    const monthFA = this.fb.array(monthFGs);
    this.projectForm.setControl('projectMonths', monthFA);
  }

  createMonth(month: Month): FormGroup {
    return this.fb.group({
      projectId: month.projectId,
      monthId: month.monthId,
      monthNo: month.monthNo,
      phaseId: month.phaseId,
      totalPlannedExpense: [{ value: month.totalPlannedExpense, disabled: true }],
      totalPlannedCapital: [{ value: month.totalPlannedCapital, disabled: true }],
      totalActualExpense: [{ value: month.totalActualExpense, disabled: true }],
      totalActualCapital: [{ value: month.totalActualCapital, disabled: true }]
    });
  }

  setResourceRows(resources: Resource[]) {
    const resourceFGs = resources.map(
      resource => this.createResource(resource));
    const resourceFA = this.fb.array(resourceFGs);
    this.projectForm.setControl('resourceRows', resourceFA);
  }

  createResource(resource: Resource) {
    return this.fb.group({
      projectId: resource.projectId,
      resourceId: resource.resourceId,

      resourceName: resource.resourceName,
      vendor: resource.vendor,
      rate: resource.rate,
      roleId: resource.roleId,

      resourceTypeId: resource.resourceTypeId,
      totalPlannedEffort: [{ value: resource.totalPlannedEffort, disabled: true }],
      totalActualEffort: [{ value: resource.totalActualEffort, disabled: true }],
      resourceMonths: this.createResourceMonths(resource.resourceMonths)
    });
  }

  createResourceMonths(resourceMonths: ResourceMonth[]): FormArray {
    const monthFGs = resourceMonths.map(
      month => this.createResourceMonth(month));
    const monthFA = this.fb.array(monthFGs);
    return monthFA;
  }

  createResourceMonth(resourceMonth: ResourceMonth): FormGroup {
    return this.fb.group({
      resourceId: resourceMonth.resourceId,
      resourceMonthId: resourceMonth.resourceMonthId,
      monthNo: resourceMonth.monthNo,
      plannedEffort: resourceMonth.plannedEffort,
      plannedEffortCapPercent: resourceMonth.plannedEffortCapPercent,
      plannedEffortStyle: resourceMonth.plannedEffortStyle,
      actualEffort: resourceMonth.actualEffort,
      actualEffortCapPercent: resourceMonth.actualEffortCapPercent,
      actualEffortStyle: resourceMonth.actualEffortStyle
    });
  }

  setFixedRows(fixedRows: FixedPrice[]) {
    const fixedRowFGs = fixedRows.map(
      fixedRow => this.createFixedRow(fixedRow));
    const fixedRowFA = this.fb.array(fixedRowFGs);
    this.projectForm.setControl('fixedRows', fixedRowFA);
  }

  createFixedRow(fixedRow: FixedPrice) {
    return this.fb.group({
      projectId: fixedRow.projectId,
      fixedPriceId: fixedRow.fixedPriceId,
      fixedPriceName: fixedRow.fixedPriceName,
      fixedPriceTypeId: fixedRow.fixedPriceTypeId,
      resourceTypeId: fixedRow.resourceTypeId,
      vendor: fixedRow.vendor,
      totalPlannedCost: [{ value: fixedRow.totalPlannedCost, disabled: true }],
      totalActualCost: [{ value: fixedRow.totalActualCost, disabled: true }],
      fixedPriceMonths: this.createFixedPriceMonths(fixedRow.fixedPriceMonths)

    });
  }


  createFixedPriceMonths(fixedMonths: FixedPriceMonth[]): FormArray {
    const monthFGs = fixedMonths.map(
      month => this.createFixedMonth(month));
    const monthFA = this.fb.array(monthFGs);
    return monthFA;
  }

  createFixedMonth(fixedMonth: FixedPriceMonth): FormGroup {
    return this.fb.group({
      fixedPriceMonthId: fixedMonth.fixedPriceMonthId,
      monthNo: fixedMonth.monthNo,
      plannedCost: fixedMonth.plannedCost,
      plannedCostCapPercent: fixedMonth.plannedCostCapPercent,
      plannedCostStyle: fixedMonth.plannedCostStyle,
      actualCost: fixedMonth.actualCost,
      actualCostCapPercent: fixedMonth.actualCostCapPercent,
      actualCostStyle: fixedMonth.actualCostStyle,
      fixedPriceId: fixedMonth.fixedPriceId
    });
  }


  // handle the callbacks from the various right click menus
  // the row menu has delete row, add row.
  // handle the resource menu.
  resourceAddRow() {

    const resource = new Resource();
    resource.projectId = this.project.projectId,
      resource.resourceId = 0;
    resource.resourceName = '',
      resource.resourceTypeId = -1;
    resource.resourceTypeName = 'Please Select';
    resource.roleId = -1;
    resource.roleName = 'Please Select';
    resource.rate = 0;
    resource.vendor = '';
    resource.totalActualEffort = 0;
    resource.totalPlannedEffort = 0;

    resource.resourceMonths = new Array<ResourceMonth>();
    for (let i = 0; i < this.project.months.length; i++) {
      resource.resourceMonths.push(this.addResourceMonth(0, i));
    }

    const resourceRowFG = this.createResource(resource);
    const resourceRowFGs = this.projectForm.get('resourceRows') as FormArray;
    resourceRowFGs.push(resourceRowFG);
  }

  // create the resource months
  addResourceMonth(resourceId: number, monthNo: number): ResourceMonth {

    const resourceMonth = new ResourceMonth();
    // set the resource to 0 to know it is a new month.
    resourceMonth.resourceMonthId = 0;
    resourceMonth.resourceId = resourceId;
    resourceMonth.monthNo = monthNo;
    resourceMonth.actualEffort = 0;
    resourceMonth.actualEffortCapPercent = 1;
    resourceMonth.actualEffortStyle = 1;
    resourceMonth.actualEffortInError = false;
    resourceMonth.plannedEffort = 0;
    resourceMonth.plannedEffortCapPercent = 1;
    resourceMonth.plannedEffortStyle = 1;
    resourceMonth.plannedEffortInError = false;
    return resourceMonth;
  }

  resourceCopyRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);

    // can only paste resources now.
    this.canPasteResourceRow = true;
    this.canPastefixedPriceRow = false;
    this.canPasteMonthRow = false;

    // set a referece the row we want to copy.
    const resourceFGs = this.projectForm.get('resourceRows') as FormArray;
    this.resourceRowFG = resourceFGs.controls[index] as FormGroup;
  }

  resourcePasteRow(val: string) {
    const resourceFGs = this.projectForm.get('resourceRows') as FormArray;
    resourceFGs.push(this.resourceRowFG);
  }

  resourceDeleteRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);

    // turn off the ability to paste as we may have deleted the row
    this.canPasteResourceRow = false;
    const resourceFGs = this.projectForm.get('resourceRows') as FormArray;
    resourceFGs.removeAt(index);
  }

  // handle the fixed fee menu.
  fixedPriceAddRow(): any {
    const fixedPrice = new FixedPrice();
    fixedPrice.projectId = this.project.projectId;
    fixedPrice.fixedPriceId = 0;
    fixedPrice.resourceTypeId = -1;
    fixedPrice.fixedPriceTypeId = -1;

    fixedPrice.fixedPriceMonths = new Array<FixedPriceMonth>();
    for (let i = 0; i < this.project.months.length; i++) {

      fixedPrice.fixedPriceMonths.push(this.addFixedMonth(0, i));
    }

    const fixedPriceRowFG = this.createFixedRow(fixedPrice);
    const fixedPriceRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceRowFGs.push(fixedPriceRowFG);

  }

  addFixedMonth(fixedPriceId: number, monthNo: number): FixedPriceMonth {
    const fixedMonth = new FixedPriceMonth();
    fixedMonth.monthNo = monthNo;
    fixedMonth.fixedPriceId = fixedPriceId;
    fixedMonth.fixedPriceMonthId = 0;
    fixedMonth.actualCost = 0;
    fixedMonth.actualCostCapPercent = 1;
    fixedMonth.actualCostStyle = 1;
    fixedMonth.plannedCost = 0;
    fixedMonth.plannedCostCapPercent = 1;
    fixedMonth.plannedCostStyle = 1;
    return fixedMonth;
  }

  fixedPriceCopyRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);
    this.canPastefixedPriceRow = true;
    this.canPasteResourceRow = false;
    this.canPasteMonthRow = false;

    const fixedPriceRowFGs = this.projectForm.get('fixedRows') as FormArray;
    this.fixedPriceRowFG = fixedPriceRowFGs.controls[index] as FormGroup;
  }

  fixedPricePasteRow(val: string) {
    const fixedPriceRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceRowFGs.push(this.fixedPriceRowFG);
  }

  fixedPriceDeleteRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);
    this.canPastefixedPriceRow = false;
    const fixedPriceRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceRowFGs.removeAt(index);
  }

  // handle the month menu commands
  addProjectMonth() {
    const projectMonthsFA = this.projectForm.get('projectMonths') as FormArray;
    const monthNo = projectMonthsFA.controls.length;

    // create a new month
    const month = new Month();
    month.projectId = this.project.projectId;
    month.monthId = 0;
    month.monthNo = monthNo;
    month.phaseId = -1;
    month.totalActualCapital = 0;
    month.totalActualExpense = 0;
    month.totalPlannedCapital = 0;
    month.totalPlannedExpense = 0;

    // crate the formgrooup and push it to array.
    const monthFG = this.createMonth(month);
    projectMonthsFA.push(monthFG);

    // go through each of the resources and add a month.
    const resourcesFA = this.projectForm.get('resourceRows') as FormArray;
    resourcesFA.controls.forEach((resource) => {
      const resourceMonthsFA = resource.get('resourceMonths') as FormArray;
      const resourceMonth = this.addResourceMonth(resource.get('resourceId').value, monthNo);
      const resourceMonthFG = this.createResourceMonth(resourceMonth);
      resourceMonthsFA.push(resourceMonthFG);
      });

    const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceFA.controls.forEach(fixedPrice => {
      const fixedPriceMonthsFA = fixedPrice.get('fixedPriceMonths') as FormArray;
      const fixedPriceMonth = this.addFixedMonth(fixedPrice.get('fixedPriceId').value, monthNo);
      const fixedPriceMonthFG = this.createFixedMonth(fixedPriceMonth);
      fixedPriceMonthsFA.push(fixedPriceMonthFG);
    });

    this.calcPageSize();
  }

  copyProjectMonth(index: number) {

  }

  pasteProjectMonth(index: number) {

  }

  pasteInsertProjectMonth(index: number) {

  }

  deleteProjectMonth(index: number) {
  }

  getSelectedCells(event) {
    // this get the set of cells that are selected in the month columns
    // using the multiselected cell directive.
    // It returns a set of TD elememnts
    this.selectedCells = event;
  }

  updateSelectedCells(event: MenuItem) {

    const style = event[0].order;
    const capWeight = event[0].capWeight;

    // the ids are added to the selected ids array through the multi-select directive
    // in the form type-row-col.  e.g. 'res-1-8' resource, row no ,and column no.
    // or 'fix-1-8' fixedprice, row no, column number.
    const resourceFA = this.projectForm.get('resourceRows') as FormArray;
    const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;

    for (const el of this.selectedCells) {
      el.classList.remove('eng-selected-item');
      el.classList.remove('hover-area');

      const cells = el.attributes['id'].nodeValue.split('-');
      const rowIndex = Number(cells[1]);
      const monthIndex = Number(cells[2]) + this.fcol;


      if (cells[0] === 'res') {
        // go through the set of resoruce and months and update to percent

        const resourceRowFG = resourceFA.controls[rowIndex] as FormGroup;
        const resourceMonthFA = resourceRowFG.get('resourceMonths') as FormArray;
        const resourceMonthFG = resourceMonthFA.controls[monthIndex] as FormGroup;
        if (this.selectedView === 'Forecast') {
          resourceMonthFG.get('plannedEffortCapPercent').setValue(capWeight);
          resourceMonthFG.get('plannedEffortStyle').setValue(style);
        } else {
          resourceMonthFG.get('actualEffortCapPercent').setValue(capWeight);
          resourceMonthFG.get('actualEffortStyle').setValue(style);
        }


      } else {

        const fixedPriceRowFG = fixedPriceFA.controls[rowIndex] as FormGroup;
        const fixedPriceMonthFA = fixedPriceRowFG.get('fixedPriceMonths') as FormArray;
        const fixedPriceMonthFG = fixedPriceMonthFA.controls[monthIndex] as FormGroup;
        if (this.selectedView === 'Forecast') {
          fixedPriceMonthFG.get('plannedCostCapPercent').setValue(capWeight);
          fixedPriceMonthFG.get('plannedCostStyle').setValue(style);
        } else {
          fixedPriceMonthFG.get('actualCostCapPercent').setValue(capWeight);
          fixedPriceMonthFG.get('actualCostStyle').setValue(style);
        }
      }
    }
  }


  // manage the scrolling of the months
  scrollRight() {
    if (this.lcol < this.project.months.length) {
      this.lcol++;
      this.fcol++;
    } else {
      this.toast.info('At the end', 'Sorry');
    }

  }

  pageRight() {
    if (this.lcol + this.pageSize < this.project.months.length) {
      this.lcol += this.pageSize;
      this.fcol += this.pageSize;
    } else if (this.lcol < this.project.months.length) {
      this.lcol = this.project.months.length;
      this.fcol = this.lcol - this.pageSize;
    } else {
      this.toast.info('At the end', 'Sorry');
    }

  }

  scrollLeft() {
    if (this.fcol > 1) {
      this.lcol--;
      this.fcol--;
    } else {
      this.toast.info('At the end', 'Sorry');
    }
  }

  pageLeft() {
    if (this.fcol - this.pageSize > 0) {
      this.lcol -= this.pageSize;
      this.fcol -= this.pageSize;
    } else if (this.fcol > 0) {
      this.lcol = this.pageSize;
      this.fcol = 0;
    } else {
      this.toast.info('At the end', 'Sorry');
    }

  }
  calcPageSize() {
    // find the inner client witdh
    // find first parent with width
    let width = 0;
    let notFound = true;
    let element = this.el.nativeElement.parentElement;
    do {

      if (element.clientWidth > 0) {
        notFound = false;
        width = element.clientWidth;
      } else {
        element = element.parentElement;
      }
    } while (notFound);
    console.log('window width: ', width);

    // the size of the left columns including name etc.
    // find table element
    const tableElem = this.el.nativeElement.querySelector('table');

    // first pass the client width is greater than the maximum.
    let staticColWidth = 0;
    for (let i = 0; i < 7; i++) {
      staticColWidth += tableElem.rows[0].cells[i].clientWidth;
      console.log('staticColWidth: ', staticColWidth);
    }
    // max allowed for the first 7 columns is after CSS applied.
    if (staticColWidth > 630 ) {
      staticColWidth = 630;
    }

    // calculate the number of month columns will fit.
    const staticMonthWidth = 72;
    this.pageSize = Math.floor((width - staticColWidth) / staticMonthWidth);

    const projectMonthsFA = this.projectForm.get('projectMonths') as FormArray;
    if (this.pageSize >= projectMonthsFA.controls.length) {
      this.showPaginator = false;
      this.fcol = 0;
      this.lcol = projectMonthsFA.controls.length;
    } else {
      this.lcol = this.fcol + this.pageSize;
      this.showPaginator = true;
    }
  }

  // save the updated project
  onSubmit() {
    this.projectForm.updateValueAndValidity();
    if (this.projectForm.invalid) {
      return;
    }

    const project: Project = this.getProjectFromFormValue(this.projectForm.getRawValue());

    this.projectService.update(project.projectId, project).subscribe(data => {
      this.project = data;
      this.toast.success('Project has been updated', 'Success');
      this.projectChange.emit(this.project);

    },
      error => {
        this.toast.error(error, 'Oops');
        console.log(error);
      });
  }

  getProjectFromFormValue(formValue: any): Project {
    const project = new Project();

    project.projectId = this.project.projectId;
    project.isTemplate = this.project.isTemplate;
    project.projectName = this.project.projectName;
    project.projectDesc = this.project.projectDesc;
    project.projectManager = this.project.projectManager;

    // the date picker return an instance of date so convert it back to string.

    project.plannedStartDate = this.project.plannedStartDate;
    project.actualStartDate = this.project.actualStartDate;
    project.groupId = this.project.groupId;
    project.statusId = this.project.statusId;


    // add the other parts of the object we didn't touch.
    if (this.project.budgets !== null) {
      project.budgets = this.project.budgets;
    }
    if (this.project.milestones !== null) {
      project.milestones = this.project.milestones;
    }

    if (this.project.vendors !== null) {
      project.vendors = this.project.vendors;
    }

    const months: Month[] = formValue.projectMonths.map(
      (month: Month) => Object.assign({}, month)
    );
    project.months = months;

    const resources: Resource[] = formValue.resourceRows.map(
      (resource: Resource) => Object.assign({}, resource)
    );
    project.resources = resources;

    const fixedPrices: FixedPrice[] = formValue.fixedRows.map(
      (fixedPrice: FixedPrice) => Object.assign({}, fixedPrice)
    );
    project.fixedPriceCosts = fixedPrices;

    return project;

  }

  revert() { this.ngOnChanges(); }

  cancel() { this.router.navigate(['../../projects'], {relativeTo: this.route,
    queryParams: { $filter: 'IsTemplate eq false'}}); }
}
