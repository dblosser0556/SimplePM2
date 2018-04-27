import { Component, OnInit, Input, OnChanges, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import {
  Project, Resource, Month, ResourceMonth, Phase,
  ResourceType, FixedPriceType, Role, FixedPrice, FixedPriceMonth, MenuItem
} from '../../../models';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ToastrService } from 'ngx-toastr';
import { ProjectService, ConfigService } from '../../../services';
import { UtilityService } from '../../../services/utility.service';

@Component({
  selector: 'app-project-detail-by-month',
  templateUrl: './project-detail-by-month.component.html',
  styleUrls: ['./project-detail-by-month.component.scss']
})
export class ProjectDetailByMonthComponent implements OnInit, OnChanges, AfterViewInit {


  menuItems: MenuItem[];
  selectedCells: any;
  showPaginator: boolean;
  isLoading: boolean;
  private _project = new BehaviorSubject<Project>(undefined);

  @Input() set project(value: Project) {
    this._project.next(value);
  }

  get project() {
    return this._project.getValue();
  }
  @Input() selectedView: any;
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

    // get the preconfigured menu items.
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
      totalPlannedExpense: [{value: month.totalActualExpense, disabled: true}],
      totalPlannedCapital: [{value: month.totalPlannedCapital, disabled: true}],
      totalActualExpense: [{value: month.totalActualExpense, disabled: true}],
      totalActualCapital: [{value: month.totalActualCapital, disabled: true}]
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
      totalPlannedEffort: [{ value: resource.totalPlannedEffort, disabled: true}],
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
      totalPlannedCost: [{ value: fixedRow.totalPlannedCost, disabled: true}],
      totalActualCost: [{value: fixedRow.totalActualCost, disabled: true}],
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


  getSelectedCells(event) {
    // this get the set of cells that are selected in the month columns
    // using the multiselected cell directive.
    // It returns a set of TD elememnts
    this.selectedCells = event;
  }

  updateSelectCells(event: MenuItem) {
    console.log('button fired');
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

}
