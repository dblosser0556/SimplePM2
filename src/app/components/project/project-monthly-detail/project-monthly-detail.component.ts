import { Component, OnInit, AfterViewInit, Input, HostListener,  ElementRef } from '@angular/core';
import {
  Project, Resource, ResourceMonth, Month,
  Phase, ResourceType, FixedPriceType, Role, FixedPrice,
  FixedPriceMonth,
  CapWeightPercent
} from '../../../models';
import { ProjectService } from '../../../services';
import { UtilityService } from '../../../services/utility.service';
import { ConfigService } from '../../../services/config.service';
import { ToastrService } from 'ngx-toastr';





export enum EditingType {
  none,
  month,
  resource,
  fixedPrice
}

@Component({
  selector: 'app-project-monthly-detail',
  templateUrl: './project-monthly-detail.component.html',
  styleUrls: ['./project-monthly-detail.component.scss']
})
export class ProjectMonthlyDetailComponent implements OnInit, AfterViewInit {


  @Input() project: Project;
  @Input() selectedView: string;



  phaseList: Phase[] = [];
  resourceTypeList: ResourceType[] = [];
  fixedPriceTypeList: FixedPriceType[] = [];
  roleList: Role[] = [];
  selectedCells = [];

  menuItems: CapWeightPercent[] = [];

  savedResource: Resource;
  savedFixedPrice: FixedPrice;
  displayProject: Project;
  lcol = 3;
  fcol = 0;
  pageSize = 5;

  showPaginator = true;

  editingIndex = -1;
  editingType: EditingType = EditingType.none;

  newResourceCount = 0;
  newFixedCostCount = 0;
  newMonthCount = 0;

  autoSave = true;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calcPageSize();
  }

  @HostListener('document:keyup', ['$event']) handleKeyUpEvent(event: KeyboardEvent) {

    if (event.key === 'Escape') {
      switch (this.editingType) {
        case EditingType.none:
          return;
        case EditingType.month:
          this.cancelPhase(this.project.months[this.editingIndex], this.editingIndex);
          return;
        case EditingType.fixedPrice:
          this.cancelFixedPriceEdit(this.project.fixedPriceCosts[this.editingIndex], this.editingIndex);
          return;
        case EditingType.resource:
          this.updateMonthlyResourceTotal(this.project.resources[this.editingIndex]);
          this.cancelResourceEdit(this.project.resources[this.editingIndex], this.editingIndex);
          return;

      }
    } else if (event.key === 'Tab') {
      console.log('key up:', event.key);
    }
  }

  constructor(
    private projectService: ProjectService,
    private toast: ToastrService,
    private util: UtilityService,
    private config: ConfigService,
    private el: ElementRef) {

    this.phaseList = this.util.getPhaseList();
    this.fixedPriceTypeList = this.util.getFixedPriceTypeList();
    this.resourceTypeList = this.util.getResourceTypeList();
    this.roleList = this.util.getRoles();

  }


  ngOnInit() {
   
    
    this.menuItems = this.config.capWeightConfig;
  }

  ngAfterViewInit() {
    this.calcPageSize();
  } 


  getSelectedCells(event) {
    // this get the set of cells that are selected in the month columns
    // using the multiselected cell directive.
    // It returns a set of TD elememnts
    this.selectedCells = event;
  }

  saveProject() {
    this.projectService.update(this.project.projectId, this.project).subscribe(
      results => {
        this.toast.success('Project has been saved', 'Congrates');
      },
      error => {
        this.toast.error(error, 'Oops - Bad on Me');
        console.log(error);
      }
    );


  }
  // Add months and resources
  addMonth() {

    if (this.project.months === null) {
      this.project.months = [];
    }

    const projectMonth = new Month();

    projectMonth.projectId = this.project.projectId;
    projectMonth.monthNo = 0;
    projectMonth.phaseId = -1;
    projectMonth.monthId = this.newMonthCount;
    projectMonth.phaseName = '--Select--';
    projectMonth.totalActualCapital = 0;
    projectMonth.totalActualExpense = 0;
    projectMonth.totalPlannedCapital = 0;
    projectMonth.totalPlannedExpense = 0;


    const monthNo = this.project.months.push(projectMonth) - 1;
    projectMonth.monthNo = monthNo;

    if (this.project.resources !== null) {
      for (const resource of this.project.resources) {
        this.addResourceMonth(resource, monthNo);

      }
    }

    if (this.project.fixedPriceCosts !== null) {
      for (const fixedPrice of this.project.fixedPriceCosts) {
        this.addFixedPriceMonth(fixedPrice, monthNo);

      }
    }

    this.calcPageSize();
    this.toast.success('Month has been added');

  }

  addResource() {

    if (this.project.resources === null) {
      this.project.resources = [];
    }
    this.newResourceCount--;
    const resource = new Resource();
    resource.projectId = this.project.projectId,
      resource.resourceId = this.newResourceCount,
      resource.resourceName = '',
      resource.resourceTypeId = -1;
    resource.resourceTypeName = 'Please Select';
    resource.roleId = -1;
    resource.roleName = 'Please Select';
    resource.rate = 0;
    resource.vendor = '';
    resource.totalActualEffort = 0;
    resource.totalPlannedEffort = 0;



    this.project.resources.push(resource);

    if (this.project.months != null) {
      for (const projectMonth of this.project.months) {
        this.addResourceMonth(resource, projectMonth.monthNo);
      }
    }
    this.toast.success('Resource has been add', 'Congrates');
  }

  addResourceMonth(resource: Resource, monthNo: number) {

    if (resource.resourceMonths === null ||
      resource.resourceMonths === undefined) {
      resource.resourceMonths = [];
    }

    const resourceMonth = new ResourceMonth();
    // set the resource to negative to know it is a new month.
    // use the negative month no to make it unique.
    resourceMonth.resourceMonthId = -monthNo;
    resourceMonth.resourceId = resource.resourceId;
    resourceMonth.monthNo = monthNo;
    resourceMonth.actualEffort = 0;
    resourceMonth.actualEffortCapPercent = 1;
    resourceMonth.actualEffortStyle = 1;
    resourceMonth.actualEffortInError = false;
    resourceMonth.plannedEffort = 0;
    resourceMonth.plannedEffortCapPercent = 1;
    resourceMonth.plannedEffortStyle = 1;
    resourceMonth.plannedEffortInError = false;

    resource.resourceMonths.push(resourceMonth);

  }

  addProjectFixedPrice() {
    if (this.project.fixedPriceCosts === null) {
      this.project.fixedPriceCosts = [];
    }

    const fixedPrice = new FixedPrice();
    // update counter to create unique entry.
    // this is used in the formatting of
    this.newFixedCostCount--;
    fixedPrice.projectId = this.project.projectId,
      fixedPrice.fixedPriceId = this.newFixedCostCount,
      fixedPrice.fixedPriceName = '',
      fixedPrice.resourceTypeId = -1;
    fixedPrice.resourceTypeName = 'Please Select';
    fixedPrice.fixedPriceTypeId = -1;
    fixedPrice.fixedPriceTypeName = 'Please Select';
    fixedPrice.vendor = '';


    this.project.fixedPriceCosts.push(fixedPrice);

    if (this.project.months != null) {
      for (const projectMonth of this.project.months) {
        this.addFixedPriceMonth(fixedPrice, projectMonth.monthNo);
      }
    }
    this.toast.success('Fixed row has been added.', 'Congrates');
  }

  addFixedPriceMonth(projectFixedPrice: FixedPrice, monthNo: number) {

    if (projectFixedPrice.fixedPriceMonths === null ||
      projectFixedPrice.fixedPriceMonths === undefined) {
      projectFixedPrice.fixedPriceMonths = [];
    }

    const fixedPriceMonth = new FixedPriceMonth();
    fixedPriceMonth.fixedPriceMonthId = -monthNo;
    fixedPriceMonth.fixedPriceId = projectFixedPrice.fixedPriceId;
    fixedPriceMonth.monthNo = monthNo;
    fixedPriceMonth.actualCost = 0;
    fixedPriceMonth.actualCostCapPercent = 1;
    fixedPriceMonth.actualCostStyle = 1;
    fixedPriceMonth.actualCostInError = false;
    fixedPriceMonth.plannedCost = 0;
    fixedPriceMonth.plannedCostCapPercent = 1;
    fixedPriceMonth.plannedCostStyle = 1;
    fixedPriceMonth.plannedCostCapInError = false;


    projectFixedPrice.fixedPriceMonths.push(fixedPriceMonth);

  }

  editPhase(month, index) {
    if (this.editingIndex === -1) {
      month.editMode = true;
      this.editingIndex = index;
      this.editingType = EditingType.month;
    } else if (this.editingIndex !== index || this.editingType !== EditingType.month) {
      this.saveOrCancelEdit();
      this.editPhase(month, index);
    }
  }

  updatePhase(event, month) {
    month.phaseId = Number(event.target.value);
    month.phaseName = this.util.findPhaseName(month.phaseId);
    month.editMode = false;
    this.editingType = EditingType.none;
    this.editingIndex = -1;
  }

  cancelPhase(month, index) {
    month.editMode = false;
    this.editingType = EditingType.none;
    this.editingIndex = -1;
  }

  // Manage in-line editing for the Project Resource
  editResource(resource, index) {
    if (this.editingIndex === -1) {
      resource.editMode = true;
      this.editingIndex = index;
      this.editingType = EditingType.resource;
      this.savedResource = new Resource(resource);
    } else if (this.editingIndex !== index || this.editingType !== EditingType.resource) {
      this.saveOrCancelEdit();
      this.editResource(resource, index);
    }

  }

  cancelResourceEdit(resource, index) {
    // reset the resource based on the saved values

    resource.projectId = this.savedResource.projectId;
    resource.resourceId = this.savedResource.resourceId;
    resource.resourceName = this.savedResource.resourceName;
    resource.roleId = this.savedResource.roleId;
    resource.roleName = this.savedResource.roleName;
    resource.rate = this.savedResource.rate;
    resource.resourceTypeId = this.savedResource.resourceTypeId;
    resource.resourceTypeName = this.savedResource.resourceTypeName;
    resource.vendor = this.savedResource.vendor;

    if (this.savedResource.resourceMonths !== null) {
      let i = 0;
      for (const month of this.savedResource.resourceMonths) {
        resource.resourceMonths[i].actualEffort = month.actualEffort;
        resource.resourceMonths[i].actualEffortCapPercent = month.actualEffortCapPercent;
        resource.resourceMonths[i].monthNo = month.monthNo;
        resource.resourceMonths[i].plannedEffort = month.plannedEffort;
        resource.resourceMonths[i].plannedEffortCapPercent = month.plannedEffortCapPercent;
        resource.resourceMonths[i].resourceId = month.resourceId;
        resource.resourceMonths[i].resourceEffortMonthId = month.resourceMonthId;
        i++;
      }
    }

    resource.editMode = false;
    this.editingIndex = -1;
    this.editingType = EditingType.none;
  }

  deleteResource(resource, index) {
    this.project.resources.splice(index, 1);
  }

  saveResourceEdit(resource, index) {
    resource.editMode = false;
    this.editingIndex = -1;
    this.editingType = EditingType.none;
  }

  updateResource(event, cell, resource, month?, mIndex?) {


    switch (cell) {
      case 'resourceName':
        resource.resourceName = event.target.value;
        break;
      case 'vendor':
        resource.vendor = event.target.value;
        break;
      case 'rate':
        resource.rate = event.target.value;
        this.updateMonthlyResourceTotal(resource);
        this.updateAllMonthlyTotals();
        break;
      case 'role':
        resource.roleId = Number(event.target.value);
        resource.roleName = this.util.findRoleName(resource.roleId);
        break;
      case 'type':
        resource.resourceTypeId = Number(event.target.value);
        resource.resourceTypeName = this.util.findTypeName(resource.resourceTypeId);
        break;
      case 'effortmonth':
        month.plannedEffort = Number(event.target.value);
        this.updateMonthlyResourceTotal(resource);
        this.updateMonthlyTotals(mIndex);
        console.log('effort update: ', mIndex);
        break;
      case 'actualmonth':
        month.actualEffort = Number(event.target.value);
        this.updateMonthlyResourceTotal(resource);
        this.updateMonthlyTotals(mIndex);
        break;
    }


  }

  // support fixed price entry rows
  // Manage in-line editing for the Project Resource
  editFixedPrice(fixedPrice, index) {
    if (this.editingIndex === -1) {
      fixedPrice.editMode = true;
      this.editingIndex = index;
      this.editingType = EditingType.fixedPrice;
      this.savedFixedPrice = new FixedPrice(fixedPrice);
    } else if (this.editingIndex !== index || this.editingType !== EditingType.fixedPrice) {
      // this.errors.showUserMessage(ToastrType.info, 'Sorry', 'Only one row at a time', false, 2000);
      this.saveOrCancelEdit();
      this.editFixedPrice(fixedPrice, index);
    }

  }

  cancelFixedPriceEdit(fixedPrice, index) {
    // reset the fixedPrice based on the saved values

    fixedPrice.projectId = this.savedFixedPrice.projectId;
    fixedPrice.fixedPriceId = this.savedFixedPrice.fixedPriceId;
    fixedPrice.fixedPriceName = this.savedFixedPrice.fixedPriceName;
    fixedPrice.projectRoleId = this.savedFixedPrice.resourceTypeId;
    fixedPrice.projectRoleName = this.savedFixedPrice.resourceTypeName;
    fixedPrice.fixedPriceTypeId = this.savedFixedPrice.fixedPriceTypeId;
    fixedPrice.fixedPriceTypeName = this.savedFixedPrice.fixedPriceTypeName;
    fixedPrice.vendor = this.savedFixedPrice.vendor;

    if (this.savedFixedPrice.fixedPriceMonths !== null) {
      let i = 0;
      for (const month of this.savedFixedPrice.fixedPriceMonths) {
        fixedPrice.fixedPriceMonths[i].actualCost = month.actualCost;
        fixedPrice.fixedPriceMonths[i].actualCostCapPercent = month.actualCostCapPercent;
        fixedPrice.fixedPriceMonths[i].monthNo = month.monthNo;
        fixedPrice.fixedPriceMonths[i].plannedCost = month.plannedCost;
        fixedPrice.fixedPriceMonths[i].plannedCostCapPercent = month.plannedCostCapPercent;
        fixedPrice.fixedPriceMonths[i].projectFixedPriceId = month.fixedPriceId;
        fixedPrice.fixedPriceMonths[i].fixedPriceMonthId = month.fixedPriceMonthId;
        i++;
      }
    }

    fixedPrice.editMode = false;
    this.editingIndex = -1;
    this.editingType = EditingType.none;
  }

  deleteFixedPrice(fixedPrice, index) {
    this.project.fixedPriceCosts.splice(index, 1);
  }

  saveFixedPriceEdit(fixedPrice, index) {
    fixedPrice.editMode = false;
    this.editingIndex = -1;
    this.editingType = EditingType.none;
  }

  updateFixedPrice(event, cell, fixedPrice, month?, mIndex?) {


    switch (cell) {
      case 'name':
        fixedPrice.fixedPriceName = event.target.value;
        break;
      case 'vendor':
        fixedPrice.vendor = event.target.value;
        break;
      case 'role':
        fixedPrice.fixedPriceTypeId = Number(event.target.value);
        fixedPrice.fixedPriceTypeName = this.util.findFixedPriceTypeName(fixedPrice.fixedPriceTypeId);
        break;
      case 'type':
        fixedPrice.resourceTypeId = Number(event.target.value);
        fixedPrice.resourceTypeName = this.util.findTypeName(fixedPrice.resourceTypeId);
        break;
      case 'plannedcost':
        month.plannedCost = Number(event.target.value);
        this.updateMonthlyFixedCostTotal(fixedPrice);
        this.updateMonthlyTotals(mIndex);
        break;
      case 'actualcost':
        month.actualCost = Number(event.target.value);
        this.updateMonthlyFixedCostTotal(fixedPrice);
        this.updateMonthlyTotals(mIndex);
        break;
    }
  }

  // save or cancel the current row of phase 
  saveOrCancelEdit(): any {
    switch (this.editingType) {
      case EditingType.fixedPrice:
        if (this.autoSave) {
          this.saveFixedPriceEdit(this.project.fixedPriceCosts[this.editingIndex], this.editingIndex);
        } else {
          this.cancelFixedPriceEdit(this.project.fixedPriceCosts[this.editingIndex], this.editingIndex);
        }
        break;
      case EditingType.resource:
        if (this.autoSave) {
          this.saveResourceEdit(this.project.resources[this.editingIndex], this.editingIndex);
        } else {
          this.cancelFixedPriceEdit(this.project.resources[this.editingIndex], this.editingIndex);
        }
        break;
      case EditingType.month:
        // can only cancel phase and don't have the event data to save.
        this.cancelPhase(this.project.months[this.editingIndex], this.editingIndex);
        break;
    }


  }


  updateMonthlyResourceTotal(resource: Resource) {
    let totalPlannedEffort = 0;
    let totalActualEffort = 0;
    for (const month of resource.resourceMonths) {
      totalPlannedEffort += month.plannedEffort;
      totalActualEffort += month.actualEffort;
    }
    resource.totalPlannedEffort = totalPlannedEffort;
    resource.totalActualEffort = totalActualEffort;
  }

  updateMonthlyFixedCostTotal(fixedCost: FixedPrice) {
    let totalPlannedCost = 0;
    let totalActualCost = 0;
    for (const month of fixedCost.fixedPriceMonths) {
      totalPlannedCost += month.plannedCost;
      totalActualCost += month.actualCost;
    }
    fixedCost.totalPlannedCost = totalPlannedCost;
    fixedCost.totalActualCost = totalActualCost;
  }

  updateAllMonthlyTotals() {
    this.project.months.forEach(month => {
      this.updateMonthlyTotals(month.monthNo);
    });
  }
  // consider refactoring to be only for the current month.
  updateMonthlyTotals(i) {

    let totalActualExpense = 0;
    let totalActualCapital = 0;
    let totalPlannedExpense = 0;
    let totalPlannedCapital = 0;

    for (const resource of this.project.resources) {
      totalActualCapital += resource.resourceMonths[i].actualEffort * resource.rate *
        resource.resourceMonths[i].actualEffortCapPercent;
      totalPlannedCapital += resource.resourceMonths[i].plannedEffort * resource.rate *
        resource.resourceMonths[i].plannedEffortCapPercent;
      totalActualExpense += resource.resourceMonths[i].actualEffort * resource.rate *
        (1 - resource.resourceMonths[i].actualEffortCapPercent);
      totalPlannedExpense += resource.resourceMonths[i].plannedEffort * resource.rate *
        (1 - resource.resourceMonths[i].plannedEffortCapPercent);
    }

    for (const fixedPrice of this.project.fixedPriceCosts) {

      totalActualCapital += fixedPrice.fixedPriceMonths[i].actualCost * fixedPrice.fixedPriceMonths[i].actualCostCapPercent;
      totalPlannedCapital += fixedPrice.fixedPriceMonths[i].plannedCost * fixedPrice.fixedPriceMonths[i].plannedCostCapPercent;
      totalActualExpense += fixedPrice.fixedPriceMonths[i].actualCost * (1 - fixedPrice.fixedPriceMonths[i].actualCostCapPercent);
      totalPlannedExpense += fixedPrice.fixedPriceMonths[i].plannedCost * (1 - fixedPrice.fixedPriceMonths[i].plannedCostCapPercent);
    }

    this.project.months[i].totalActualCapital = totalActualCapital;
    this.project.months[i].totalPlannedCapital = totalPlannedCapital;
    this.project.months[i].totalActualExpense = totalActualExpense;
    this.project.months[i].totalPlannedExpense = totalPlannedExpense;


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
    
    const staticMonthWidth = 75;
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
