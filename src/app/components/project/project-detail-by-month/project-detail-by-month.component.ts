import {
  Component, OnInit, Input, OnChanges, HostListener, ElementRef,
  AfterViewInit, ViewChild, Output, EventEmitter
} from '@angular/core';
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
import { MultiselectDirective } from '../../../directives/multiselect.directive';
@Component({
  selector: 'app-project-detail-by-month',
  templateUrl: './project-detail-by-month.component.html',
  styleUrls: ['./project-detail-by-month.component.scss']
})
export class ProjectDetailByMonthComponent implements OnInit, OnChanges, AfterViewInit {

  canPasteCells: boolean;
  copyCellsBuffer: any[];
  canCopyCells: boolean;
  // set up booleans for the warning/alerts
  hasActuals: boolean;
  notStarted: boolean;

  isSaving = false;

  // data structures for the copy process.
  copiedProjectMonth: { projectMonth: FormGroup; resourceMonths: any[]; fixedPriceMonths: any[]; };
  copiedResourceRowFG: FormGroup;
  copiedFixedPriceRowFG: FormGroup;
  canPasteFixedPriceRow: boolean;
  canPasteMonthCol: boolean;
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
  @ViewChild('resourceCellMenu') public resourceCellMenu: ContextMenuComponent;
  @ViewChild('fixedPriceCellMenu') public fixedPriceCellMenu: ContextMenuComponent;

  // set up access to the multiselect directive to handle the formating
  // of the table cells.
  @ViewChild(MultiselectDirective) private multiselectDirective: MultiselectDirective;

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
      if (this.project.actualStartDate === null) {
        this.notStarted = true;
      }

      // if this is the first time through create the hierarchy,
      // else just make updates.
      if (x !== undefined) {
        this.lcol = 5;

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
    this.hasActuals = false;

    this.projectForm.reset({
      projectID: this.project.projectId
    });
    this.setMonthRows(this.project.months);
    this.setResourceRows(this.project.resources);
    this.setFixedRows(this.project.fixedPriceCosts);

    this.onChanges();

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
    // subscribe to changes to the resource rows and update the totals.
    this.projectForm.get('resourceRows').valueChanges.pipe(debounceTime(400)).subscribe(val => {
      this.updateResourceTotals(val);
      this.updateMonthlyTotals();
    });


    // subscribe to changes to the fixed rows and update the totals.
    this.projectForm.get('fixedRows').valueChanges.pipe(debounceTime(400)).subscribe(val => {
      this.updateFixedPriceTotals(val);
      this.updateMonthlyTotals();
    });
  }

  // update the resource totals when a value is updated
  // or when a month is added or deleted.
  updateResourceTotals(resourceRows) {


    resourceRows.forEach(resource => {
      // when the form is first built the values are ready.
      if (resource.resourceId === null) { return; }

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

  }

  // update the fixedprice totals when a value is updated
  // or when a month is added or deleted.
  updateFixedPriceTotals(fixedPriceRows) {

    fixedPriceRows.forEach((fixedPrice: FixedPrice) => {
      // when the form is first built the values are ready.
      if (fixedPrice.fixedPriceId === null) { return; }

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

      // set the actuals flag.
      if (totalActualCapital > 0 || totalActualExpense > 0) {
        this.hasActuals = true;
      }

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
    const monthFG = this.fb.group({
      projectId: month.projectId,
      monthId: month.monthId,
      monthNo: month.monthNo,
      phaseId: month.phaseId,
      totalPlannedExpense: [{ value: month.totalPlannedExpense, disabled: true }],
      totalPlannedCapital: [{ value: month.totalPlannedCapital, disabled: true }],
      totalActualExpense: [{ value: month.totalActualExpense, disabled: true }],
      totalActualCapital: [{ value: month.totalActualCapital, disabled: true }]
    });

    // check for the project having actuals set for warning/error flags.
    if (month.totalActualExpense > 0 || month.totalActualCapital > 0) {
      this.hasActuals = true;
    }
    return monthFG;
  }

  setResourceRows(resources: Resource[]) {
    const resourceFGs = resources.map(
      resource => this.createResourceRow(resource));
    const resourceFA = this.fb.array(resourceFGs);
    this.projectForm.setControl('resourceRows', resourceFA);
  }

  createResourceRow(resource: Resource) {
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
  // as part of the ngOnChanges add the fixed price rows to
  // the projectForm
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
      month => this.createFixedPriceMonth(month));
    const monthFA = this.fb.array(monthFGs);
    return monthFA;
  }

  createFixedPriceMonth(fixedMonth: FixedPriceMonth): FormGroup {
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
  resourceAddRow(val?: string) {

    const resourceRowFGs = this.projectForm.get('resourceRows') as FormArray;
    let index = resourceRowFGs.controls.length;
    if (val !== undefined) {
      const vals = val.split(':');
      index = Number(vals[0]);
    }

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

    const resourceRowFG = this.createResourceRow(resource);

    resourceRowFGs.insert(index, resourceRowFG);
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

    // remove the copy cell outline if any.
    this.multiselectDirective.clearCopyCells();
    // set the copy row. Add 2 for the two header rows.
    this.multiselectDirective.setRow(index + 2);

    // can only paste resources now.
    this.canPasteResourceRow = true;
    this.canPasteFixedPriceRow = false;
    this.canPasteMonthCol = false;
    this.canCopyCells = false;

    // set a referece the row we want to copy.
    const resourceFGs = this.projectForm.get('resourceRows') as FormArray;
    const copiedResourceRowFG = resourceFGs.controls[index] as FormGroup;


    const resource: Resource = Object.assign({}, copiedResourceRowFG.getRawValue());

    resource.resourceId = 0;
    resource.resourceMonths.forEach(month => { month.resourceId = 0; month.resourceMonthId = 0; });
    this.copiedResourceRowFG = this.createResourceRow(resource);

  }

  resourcePasteRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);

    this.resourceDeleteRow(val);
    const resourceFGs = this.projectForm.get('resourceRows') as FormArray;
    resourceFGs.insert(index, this.copiedResourceRowFG);
  }


  resourceInsertRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);

    const resourceFGs = this.projectForm.get('resourceRows') as FormArray;
    resourceFGs.insert(index, this.copiedResourceRowFG);
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
  fixedPriceAddRow(val?: string): any {
    const fixedPriceRowFA = this.projectForm.get('fixedRows') as FormArray;
    let index = fixedPriceRowFA.controls.length;
    if (val !== undefined) {
      const vals = val.split(':');
      index = Number(vals[0]);
    }

    const fixedPrice = new FixedPrice();
    fixedPrice.projectId = this.project.projectId;
    fixedPrice.fixedPriceId = 0;
    fixedPrice.resourceTypeId = -1;
    fixedPrice.fixedPriceTypeId = -1;
    fixedPrice.vendor = '';
    fixedPrice.fixedPriceName = '';

    fixedPrice.fixedPriceMonths = new Array<FixedPriceMonth>();
    for (let i = 0; i < this.project.months.length; i++) {

      fixedPrice.fixedPriceMonths.push(this.addFixedMonth(0, i));
    }

    const fixedPriceRowFG = this.createFixedRow(fixedPrice);

    fixedPriceRowFA.insert(index, fixedPriceRowFG);

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

  // copy the fixedprice row into a buffer for later use and
  // set the class indicating that what we are copying.
  fixedPriceCopyRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);


    // remove the copy cell outline if any.
    this.multiselectDirective.clearCopyCells();
    // set the copy row class.
    // get the number of rows in the resource rows array
    const resourceRowsFA = this.projectForm.get('resourceRows') as FormArray;
    // Add 3 for the three header rows.
    this.multiselectDirective.setRow(resourceRowsFA.controls.length + index + 3);


    this.canPasteFixedPriceRow = true;
    this.canPasteResourceRow = false;
    this.canPasteMonthCol = false;

    const fixedPriceRowFGs = this.projectForm.get('fixedRows') as FormArray;
    const copiedFixedPriceRowFG = fixedPriceRowFGs.controls[index] as FormGroup;
    const fixedPrice: FixedPrice = Object.assign({}, copiedFixedPriceRowFG.getRawValue());

    fixedPrice.fixedPriceId = 0;
    fixedPrice.fixedPriceMonths.forEach(month => { month.fixedPriceId = 0; month.fixedPriceMonthId = 0; });
    this.copiedFixedPriceRowFG = this.createFixedRow(fixedPrice);
  }

  // handle the paste row event on a fixedprice row.
  fixedPricePasteRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);
    this.fixedPriceDeleteRow(val);
    const fixedPriceRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceRowFGs.insert(index, this.copiedFixedPriceRowFG);
  }

  fixedPriceInsertRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);
    const fixedPriceRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceRowFGs.insert(index, this.copiedFixedPriceRowFG);
  }

  fixedPriceDeleteRow(val: string) {
    const vals = val.split(':');
    const index = Number(vals[0]);

    const fixedPriceRowFGs = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceRowFGs.removeAt(index);

    this.setNoCopy();
  }


  // handle the add month event.
  projectMonthAddMonth() {
    this.insertNewProjectMonthCol();
    this.calcPageSize();
  }
  // handle the insert month event.
  projectMonthInsertMonth(val: string) {
    const vals = val.split(':');
    const col = Number(vals[1]);
    this.insertNewProjectMonthCol(col);
    this.renumberMonths();
    this.calcPageSize();
  }
  // handle the paste insert event.
  projectMonthInsertandPasteMonth(val: string) {
    const vals = val.split(':');
    const col = Number(vals[1]);
    if (!this.canPasteMonthCol) { return; }
    this.insertCopiedProjectMonth(col);
    this.renumberMonths();
    this.calcPageSize();
  }

  // handle the paste month event.
  projectMonthPasteMonth(val: string) {
    const vals = val.split(':');
    const col = Number(vals[1]);
    if (!this.canPasteMonthCol) { return; }
    this.deleteProjectMonthCol(col);
    this.insertCopiedProjectMonth(col);
    this.renumberMonths();
    this.calcPageSize();
  }

  // handle the delete month event
  projectMonthDeleteMonth(val: string) {
    // remove the copy cell outline if any.
    this.multiselectDirective.clearCopyCells();

    const vals = val.split(':');
    const col = Number(vals[1]);
    this.deleteProjectMonthCol(col);
    this.renumberMonths();
    this.calcPageSize();
  }


  // insert a blank month into the form at the passed index.
  insertNewProjectMonthCol(index?: number) {

    // remove the copy cell outline if any.
    this.multiselectDirective.clearCopyCells();

    const projectMonthsFA = this.projectForm.get('projectMonths') as FormArray;
    // set up the month no.
    let monthNo = projectMonthsFA.controls.length;
    // if index passed then use that for the month no.
    // monthno is a zero based index and is the same value
    // as the array index.
    if (index !== undefined) {
      monthNo = index;
    }

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
    projectMonthsFA.insert(monthNo, monthFG);

    // go through each of the resources and add a month.
    const resourcesFA = this.projectForm.get('resourceRows') as FormArray;
    resourcesFA.controls.forEach((resource) => {
      const resourceMonthsFA = resource.get('resourceMonths') as FormArray;
      const resourceMonth = this.addResourceMonth(resource.get('resourceId').value, monthNo);
      const resourceMonthFG = this.createResourceMonth(resourceMonth);
      resourceMonthsFA.insert(monthNo, resourceMonthFG);
    });

    const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceFA.controls.forEach(fixedPrice => {
      const fixedPriceMonthsFA = fixedPrice.get('fixedPriceMonths') as FormArray;
      const fixedPriceMonth = this.addFixedMonth(fixedPrice.get('fixedPriceId').value, monthNo);
      const fixedPriceMonthFG = this.createFixedPriceMonth(fixedPriceMonth);
      fixedPriceMonthsFA.insert(monthNo, fixedPriceMonthFG);
    });


  }


  // copy a projectMonth and the same resourceMonths and fixedPriceMonths
  // into an array so they can be later used during the paste month operation
  copyProjectMonthCol(val: string) {
    const vals = val.split(':');
    const col = Number(vals[1]);

    // remove the copy cell outline if any.
    this.multiselectDirective.clearCopyCells();
    // mark month to be copied add 8 as the index passed is the array
    // index from the form array and there are 8 other columns
    // ahead.
    this.multiselectDirective.setColumn(col + 8);

    // need to create new instances of formGroups
    const projectMonthsFA = this.projectForm.get('projectMonths') as FormArray;
    const projectMonthFG = projectMonthsFA.controls[col] as FormGroup;
    // get the rawvalues as there are disabled fields
    const projectMonthFGValue = projectMonthFG.getRawValue();

    // create a new projectMonth as assign the values from the selected month.
    const projectMonth = new Month();
    const keys = Object.keys(projectMonthFGValue);
    for (const key of keys) {
      projectMonth[key] = projectMonthFGValue[key];
    }

    // update the monthId to 0 to indicate it's a new month when saved.
    projectMonth.monthId = 0;

    // create the formGroup.
    const _projectMonthFG = this.createMonth(projectMonth);


    const resourcesFA = this.projectForm.get('resourceRows') as FormArray;
    const resourceMonths = new Array<FormGroup>();
    resourcesFA.controls.forEach((resource) => {
      const resourceMonthsFA = resource.get('resourceMonths') as FormArray;
      const resourceMonthFG = resourceMonthsFA.controls[col] as FormGroup;
      resourceMonths.push(this.createResourceMonthFromFG(resourceMonthFG));
    });

    const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;
    const fixedPriceMonths = new Array<FormGroup>();
    fixedPriceFA.controls.forEach(fixedPrice => {
      const fixedPriceMonthsFA = fixedPrice.get('fixedPriceMonths') as FormArray;
      const fixedPriceMonthFG = fixedPriceMonthsFA.controls[col] as FormGroup;
      fixedPriceMonths.push(this.createFixedPriceMonthFromFG(fixedPriceMonthFG));
    });

    this.copiedProjectMonth = { projectMonth: _projectMonthFG, resourceMonths: resourceMonths, fixedPriceMonths: fixedPriceMonths };
    this.canPasteFixedPriceRow = false;
    this.canPasteResourceRow = false;
    this.canPasteMonthCol = true;


  }

  // create a resource month FG from an passed FG
  createResourceMonthFromFG(resourceMonthFG: FormGroup): FormGroup {

    // get the raw values and create a new instance of the form group.
    const resourceMonthFGValues = resourceMonthFG.getRawValue();
    const keys = Object.keys(resourceMonthFGValues);
    const resourceMonth = new ResourceMonth();
    for (const key of keys) {
      resourceMonth[key] = resourceMonthFGValues[key];
    }
    resourceMonth.resourceMonthId = 0;
    return this.createResourceMonth(resourceMonth);
  }

  // create a fixedprice month from a passed form group
  createFixedPriceMonthFromFG(fixedPriceMonthFG: FormGroup): FormGroup {
    // get the raw values and create a new instance of the form group.
    const fixedPriceMonthFGValues = fixedPriceMonthFG.getRawValue();
    const keys = Object.keys(fixedPriceMonthFGValues);
    const fixedPriceMonth = new FixedPriceMonth();
    for (const key of keys) {
      fixedPriceMonth[key] = fixedPriceMonthFGValues[key];
    }
    fixedPriceMonth.fixedPriceMonthId = 0;
    return this.createFixedPriceMonth(fixedPriceMonth);
  }


  // this routine inserts the copied col into the appropriate position
  // in the form arrays of months, resources and fixedPrices.
  insertCopiedProjectMonth(index: number) {
    const projectMonthsFA = this.projectForm.get('projectMonths') as FormArray;
    projectMonthsFA.insert(index, this.copiedProjectMonth.projectMonth);

    const resourcesFA = this.projectForm.get('resourceRows') as FormArray;
    resourcesFA.controls.forEach((resource, row) => {
      const resourceMonthsFA = resource.get('resourceMonths') as FormArray;
      resourceMonthsFA.insert(index, this.copiedProjectMonth.resourceMonths[row]);
      console.log('res mon:', resourceMonthsFA.value);
    });

    const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceFA.controls.forEach((fixedPrice, row) => {
      const fixedPriceMonthsFA = fixedPrice.get('fixedPriceMonths') as FormArray;
      fixedPriceMonthsFA.insert(index, this.copiedProjectMonth.fixedPriceMonths[row]);
      console.log('res mon:', fixedPriceMonthsFA.value);
    });
  }

  // renumber the months because of some othe operation
  renumberMonths() {
    let i = 0;
    const projectMonthsFA = this.projectForm.get('projectMonths') as FormArray;
    projectMonthsFA.controls.forEach(month => {
      month.get('monthNo').setValue(i++);
    });


    const resourcesFA = this.projectForm.get('resourceRows') as FormArray;
    resourcesFA.controls.forEach(resource => {
      i = 0;
      const resourceMonthsFA = resource.get('resourceMonths') as FormArray;
      resourceMonthsFA.controls.forEach(month => {
        month.get('monthNo').setValue(i++);
      });
    });

    const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceFA.controls.forEach((fixedPrice, row) => {
      i = 0;
      const fixedPriceMonthsFA = fixedPrice.get('fixedPriceMonths') as FormArray;
      fixedPriceMonthsFA.controls.forEach(month => {
        month.get('monthNo').setValue(i++);
      });
    });

  }

  // remove the month, resourceMonth and fixedPriceMonth from the appropriate
  // formArrays
  deleteProjectMonthCol(index: number) {
    const projectMonthsFA = this.projectForm.get('projectMonths') as FormArray;
    projectMonthsFA.removeAt(index);

    const resourcesFA = this.projectForm.get('resourceRows') as FormArray;
    resourcesFA.controls.forEach((resource, row) => {
      const resourceMonthsFA = resource.get('resourceMonths') as FormArray;
      resourceMonthsFA.removeAt(index);
    });

    const fixedPriceFA = this.projectForm.get('fixedRows') as FormArray;
    fixedPriceFA.controls.forEach((fixedPrice, row) => {
      const fixedPriceMonthsFA = fixedPrice.get('fixedPriceMonths') as FormArray;
      fixedPriceMonthsFA.removeAt(index);
    });

    this.setNoCopy();
  }

  copyCells(val) {
    this.canCopyCells = false;
    this.canPasteCells = true;
    this.canPasteFixedPriceRow = false;
    this.canPasteMonthCol = false;
    this.canPasteResourceRow = false;

    this.cacheSelectedCells();
    this.multiselectDirective.setCopyCellRange(this.selectedCells);

  }

  setNoCopy() {
    this.canPasteCells = false;
    this.canPasteFixedPriceRow = false;
    this.canPasteMonthCol = false;
    this.canPasteResourceRow = false;
  }

  getSelectedCells(event) {
    // this get the set of cells that are selected in the month columns
    // using the multiselected cell directive.
    // It returns a set of TD elememnts
    this.selectedCells = event;
    this.canCopyCells = true;
  }


  cacheSelectedCells() {

    const copyCellsBuffer = new Array();
    for (const el of this.selectedCells) {
      const cells = el.attributes['id'].nodeValue.split('-');
      const type = cells[0];
      const rowIndex = Number(cells[1]);
      const monthIndex = Number(cells[2]) + this.fcol;
      const cell = { type: type, row: rowIndex, month: monthIndex };
      copyCellsBuffer.push(cell);
    }
    this.copyCellsBuffer = copyCellsBuffer;
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


    if (this.lcol < this.projectMonths) {
      this.lcol++;
      this.fcol++;
    } else {
      this.toast.info('At the end', 'Sorry');
    }

  }

  pageRight() {

    if (this.lcol + this.pageSize < this.projectMonths) {
      this.lcol += this.pageSize;
      this.fcol += this.pageSize;
    } else if (this.lcol < this.projectMonths) {
      this.lcol = this.projectMonths;
      this.fcol = this.lcol - this.pageSize;
    } else {
      this.toast.info('At the end', 'Sorry');
    }

  }

  scrollLeft() {
    if (this.fcol > 0) {
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

    // first pass the client width is greater than the maximum.
    let staticColWidth = 0;
    for (let i = 0; i < 7; i++) {
      staticColWidth += tableElem.rows[0].cells[i].clientWidth;

    }
    // max allowed for the first 7 columns is after CSS applied.
    if (staticColWidth > 630) {
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

  get projectMonths(): number {
    const projectMonthFA = this.projectForm.get('projectMonths') as FormArray;
    return projectMonthFA.controls.length;
  }

  // save the updated project
  onSubmit() {
    this.isSaving = true;
    this.projectForm.updateValueAndValidity();
    if (this.projectForm.invalid) {
      return;
    }

    const project: Project = this.getProjectFromFormValue(this.projectForm.getRawValue());

    this.projectService.update(project.projectId, project).subscribe(data => {
      this.project = data;
      this.toast.success('Project has been updated', 'Success');
      this.projectChange.emit(this.project);
      this.isSaving = false;
    },
      error => {
        this.isSaving = false;
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

  cancel() {
    this.router.navigate(['../../projects'], {
      relativeTo: this.route,
      queryParams: { $filter: 'IsTemplate eq false' }
    });
  }
}
