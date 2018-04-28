import { Component, OnInit, Input, OnChanges, HostListener, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-project-detail-by-month',
  templateUrl: './project-detail-by-month.component.html',
  styleUrls: ['./project-detail-by-month.component.scss']
})
export class ProjectDetailByMonthComponent implements OnInit, OnChanges, AfterViewInit {


  resourceRowFG: FormGroup;
  fixedFeeRowFG: FormGroup;
  canPasteFixedFeeRow: boolean;
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

  // set up the context menus.
  @ViewChild('resourceMenu') public resourceMenu: ContextMenuComponent;
  @ViewChild('fixedMenu') public fixedMenu: ContextMenuComponent;


  projectForm: FormGroup;

  phaseList: Phase[] = [];
  resourceTypeList: ResourceType[] = [];
  fixedPriceTypeList: FixedPriceType[] = [];
  roleList: Role[] = [];

  fcol = 0;
  lcol = 4;
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
    private config: ConfigService) {

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
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.calcPageSize();
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
    }
    );
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
      totalPlannedExpense: [{ value: month.totalActualExpense, disabled: true }],
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
      resourceId: resource.resourceId,
      role: resource.roleId,
      resourceName: resource.resourceName,
      type: resource.resourceTypeId,
      vendor: resource.vendor,
      rate: resource.rate,
      totalPlannedEffort: [{ value: resource.totalPlannedEffort, disabled: true }],
      totalActualEffort: [{ value: resource.totalActualEffort, disabled: true }],
      months: this.createResourceMonths(resource.resourceMonths)

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
      fixedPricedId: fixedRow.fixedPriceId,
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
    this.canPasteFixedFeeRow = false;
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
  fixedFeeAddRow(): any {
    const fixedFee = new FixedPrice();
    fixedFee.projectId = this.project.projectId;
    fixedFee.fixedPriceId = 0;
    fixedFee.resourceTypeId = -1;
    fixedFee.fixedPriceTypeId = -1;

    fixedFee.fixedPriceMonths = new Array<FixedPriceMonth>();
    for (let i = 0; i < this.project.months.length; i++) {

      fixedFee.fixedPriceMonths.push(this.addFixedMonth(0, i));
    }

    const fixedFeeRowFG = this.createFixedRow(fixedFee);
    const fixedFeeRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedFeeRowFGs.push(fixedFeeRowFG);

  }

  addFixedMonth(fixedPriceId: number, monthNo: number): FixedPriceMonth {
    const fixedMonth = new FixedPriceMonth();
    fixedMonth.monthNo = monthNo;
    fixedMonth.fixedPriceId = fixedPriceId;
    fixedMonth.fixedPriceMonthId = 0;
    fixedMonth.actualCost = 0;
    fixedMonth.actualCostCapPercent = 100;
    fixedMonth.actualCostStyle = 1;
    fixedMonth.plannedCost = 0;
    fixedMonth.plannedCostCapPercent = 100;
    fixedMonth.plannedCostStyle = 1;
    return fixedMonth;
  }

  fixedFeeCopyRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);
    this.canPasteFixedFeeRow = true;
    this.canPasteResourceRow = false;
    this.canPasteMonthRow = false;

    const fixedFeeRowFGs = this.projectForm.get('fixedRows') as FormArray;
    this.fixedFeeRowFG = fixedFeeRowFGs.controls[index] as FormGroup;
  }

  fixedFeePasteRow(val: string) {
    const fixedFeeRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedFeeRowFGs.push(this.fixedFeeRowFG);
  }

  fixedFeeDeleteRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);
    this.canPasteFixedFeeRow = false;
    const fixedFeeRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedFeeRowFGs.removeAt(index);
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
    const fixedFeeFA = this.projectForm.get('fixedRows') as FormArray;

    for (const el of this.selectedCells) {
      el.classList.remove('eng-selected-item');
      el.classList.remove('hover-area');

      const cells = el.attributes['id'].nodeValue.split('-');
      const rowIndex = Number(cells[1]);
      const monthIndex = Number(cells[2]) + this.fcol;


      if (cells[0] === 'res') {
        // go through the set of resoruce and months and update to percent

        const resourceRowFG = resourceFA.controls[rowIndex] as FormGroup;
        const resourceMonthFA = resourceRowFG.get('months') as FormArray;
        const resourceMonthFG = resourceMonthFA.controls[monthIndex] as FormGroup;
        if (this.selectedView === 'Forecast') {
          resourceMonthFG.get('plannedEffortCapPercent').setValue(capWeight);
          resourceMonthFG.get('plannedEffortStyle').setValue(style);
        } else {
          resourceMonthFG.get('actualEffortCapPercent').setValue(capWeight);
          resourceMonthFG.get('actualEffortStyle').setValue(style);
        }


      } else {

        const fixedFeeRowFG = fixedFeeFA.controls[rowIndex] as FormGroup;
        const fixedFeeMonthFA = fixedFeeRowFG.get('months') as FormArray;
        const fixedFeeMonthFG = fixedFeeMonthFA.controls[monthIndex] as FormGroup;
        if (this.selectedView === 'Forecast') {
          fixedFeeMonthFG.get('plannedCostCapPercent').setValue(capWeight);
          fixedFeeMonthFG.get('plannedCostStyle').setValue(style);
        } else {
          fixedFeeMonthFG.get('actualCostCapPercent').setValue(capWeight);
          fixedFeeMonthFG.get('actualCostStyle').setValue(style);
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


    // the size of the left columns including name etc.
    // find table element
    const tableElem = this.el.nativeElement.querySelector('table');

    let staticColWidth = 0;
    for (let i = 0; i < 7; i++) {
      staticColWidth += tableElem.rows[0].cells[i].clientWidth;
    }

    const staticMonthWidth = 55;
    this.pageSize = Math.floor((width - staticColWidth) / staticMonthWidth);

    if (this.lcol + this.pageSize) {
      this.lcol = this.fcol + this.pageSize;
    } else {
      this.lcol = this.project.months.length;
      this.fcol = this.lcol - this.pageSize;
    }

    if (this.pageSize >= this.project.months.length) {
      this.showPaginator = false;
    } else {
      this.showPaginator = true;
    }
  }

  // save the updated project
  onSubmit() {
    this.projectForm.updateValueAndValidity();
    if (this.projectForm.invalid) {
      return;
    }

    const project: Project  = this.getProjectFromFormValue(this.projectForm.value);

      this.projectService.update(project.projectId, project).subscribe(data => {
        this.toast.success('Group has been updated', 'Success');

      },
        error => {this.toast.error(error, 'Oops');
          console.log(error); });
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
  
  
      project.budgets = this.project.budgets;

      const months: Month[] = formValue.projectMonths.map(
        (month: Month) => Object.assign({}, month)
      );
      project.months = months;

      const resources: Resource[] = formValue.resourceRows.map(
        (resource: Resource) => Object.assign({}, resource)
      );
      project.resources = resources;

      const fixedFees: FixedPrice[] = formValue.fixedRows.map(
        (fixedFee: FixedPrice) => Object.assign({}, fixedFee)
      );
      project.fixedPriceCosts = fixedFees;

      return project;
  
    }
}
