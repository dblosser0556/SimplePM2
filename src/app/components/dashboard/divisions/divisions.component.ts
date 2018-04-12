import { Component, OnInit, OnChanges, ElementRef, HostListener } from '@angular/core';
import { StatusService } from '../../configuration/status/status.service';
import { GroupService } from '../../configuration/group/group.service';
import { Status, Group, GroupTreeView, ProjectMonthlyProjection, ChartData, Month, Budget, GroupBudget } from '../../../models';
import { ProjectMonthlyProjectionService } from '../../../services/project-monthly-projection.service';
import { ChartHelperService } from '../../../services';
import * as moment from 'moment';

export interface Year {
  value: number;
  selected: boolean;
  disabled: boolean;
}

@Component({
  selector: 'app-divisions',
  templateUrl: './divisions.component.html',
  styleUrls: ['./divisions.component.scss']
})

export class DivisionsComponent implements OnInit, OnChanges {
  isLoading = false;
  status: Status[];
  groups: Group[];
  monthlyProjections: ProjectMonthlyProjection[];
  filteredProjections: ProjectMonthlyProjection[];

  treeviewGroups: GroupTreeView[] = [];
  rootGroups: GroupTreeView[] = [];
  
  months: Month[] = [];


  data: ChartData[] = [];
  budgets: GroupBudget[];
  chartStartDate: string;
  years: Year[];

  viewCapValues = true;
  viewExpValues = true;

  title: string;

  // view: any[] = [500, 400];
  view: any[] = [];

  // char toptions
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Date';
  showYAxisLabel = true;
  yAxisLabel = 'Dollars';

  colorScheme = {
    domain: ['#9f02f9', '#2f02f9', '#029ff0', '#f90202', '#f96002', '#f9c802']
  };

  // line, area
  autoScale = true;

  constructor(private statusService: StatusService,
    private groupService: GroupService,
    private monthlyService: ProjectMonthlyProjectionService,
    private chartHelper: ChartHelperService,
    private el: ElementRef) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getChartView();
  }

  ngOnInit() {
    this.isLoading = true;

    this.getStatus();
    this.getGroups();
    this.getChartView();
  }

  ngOnChanges() {
    console.log(this.treeviewGroups);
  }

  getChartView() {
    const height = window.innerHeight - this.el.nativeElement.offsetTop - 120;
    const width = this.el.nativeElement.parentElement.clientWidth;

    const nav = this.el.nativeElement.parentElement.querySelector('.sidenav');
    this.view = [width - nav.parentElement.clientWidth - 120, height];

    console.log('height: ', this.view[1], ' width: ', this.view[0]);

  }

  getStatus() {
    this.statusService.getAll().subscribe(results => {
      this.status = results;
    }
    );
  }

  getProjects() {
    this.isLoading = true;
    this.monthlyService.getAll().subscribe(results => {
      this.monthlyProjections = this.sortProjections(results);
      this.filteredProjections = this.monthlyProjections;

      // ensure they are sorted by month
      this.months = this.chartHelper.groupMonths(this.monthlyProjections);

      // set the start date of all the data.
      this.chartStartDate = moment(this.monthlyProjections[0].startDate).format('YYYY-MM');

      // get the years for the years filter
      this.years = this.findYears(this.monthlyProjections);

      // update the status filter
      this.updateStatusFilter(results);

      // set up the chartdata
      this.convertData();
      this.isLoading = false;
    });
  }

  // get all the groups and put them in a hierarchy.
  // the tp[] groups have a parent of 0
  getGroups() {
    this.groupService.getAll().subscribe(results => {
      this.groups = results;

      // build the group hierarcy from the returned group.
      // start this all the groups that have no parent.
      for (const group of this.groups.filter(g => g.parentId === 0)) {
        const newGroupTreeView = {
          groupName: group.groupName,
          groupId: group.groupId,
          parentId: 0,
          hasChildren: this.hasChildren(group.groupId),
          groups: this.getChildren(group.groupId),
          selected: true
        };
        this.treeviewGroups.push(newGroupTreeView);
      }
      // for display the root groups are at the top of the treeView.
      this.rootGroups = this.treeviewGroups.filter(t => t.parentId === 0);

      // set the preliminary budgets base on the root groups.
      this.budgets = this.groupBudgets(this.rootGroups);

      this.getProjects();

    });
  }

  getChildren(groupId: number): GroupTreeView[] {
    const treeviewGroups: GroupTreeView[] = [];

    for (const group of this.groups.filter(g => g.parentId === groupId)) {
      const newGroupTreeView = {
        groupName: group.groupName,
        groupId: group.groupId,
        parentId: group.parentId,
        hasChildren: this.hasChildren(group.groupId),
        groups: this.getChildren(group.groupId),
        selected: true
      };
      treeviewGroups.push(newGroupTreeView);
    }
    return treeviewGroups;
  }

  hasChildren(groupId: number): boolean {
    for (const group of this.groups) {
      if (group.parentId === groupId) {
        return true;
      }
    }
    return false;
  }

  applyFilter() {
    console.log('fired');
  }


  groupBudgets(treeViewGroups: GroupTreeView[]): GroupBudget[] {
    const budgets = new Array<GroupBudget>();
    for (const group of treeViewGroups) {
      // the group budgets are by year and not in any particular order.

      // go through each group budget by group
      const index = this.groups.findIndex(g => g.groupId === group.groupId);
      if (index > 0) {
        if (this.groups[index].groupBudgets !== undefined) {
          for (const groupBudget of this.groups[index].groupBudgets) {
            // go through each of the budget years found so far 
            // add this groups budget to them or add a new group budget.
            let found = false;
            if (budgets.length > 0) {
              for (const budget of budgets) {
                if (budget.budgetYear === groupBudget.budgetYear &&
                  budget.budgetType === groupBudget.budgetType) {
                  found = true;
                  budget.amount += groupBudget.amount;
                }
              }
            }
            if (!found) {
              const newBudget: GroupBudget = {
                groupId: groupBudget.groupId,
                budgetType: groupBudget.budgetType,
                budgetYear: groupBudget.budgetYear,
                groupBudgetId: 0,
                amount: groupBudget.amount,
                approvedDateTime: ''
              };
              budgets.push(newBudget);
            }
          }
        }
      }
    }
    return budgets;

  }

  showCapChart() {
    this.viewCapValues = !this.viewCapValues;
    this.convertData();
  }

  showExpChart() {
    this.viewExpValues = !this.viewExpValues;
    this.convertData();
  }

  // sort the monthly projections
  sortProjections(monthlyProjections: ProjectMonthlyProjection[]): ProjectMonthlyProjection[] {
    const monthly = monthlyProjections.sort((leftside, rightside): number => {
      if (moment(leftside.month).isBefore(rightside.month)) { return -1; }
      if (moment(leftside.month).isAfter(rightside.month)) { return 1; }
      return 0;
    });
    return monthly;
  }

  sortProjectionsByKey(key: string, monthlyProjections: ProjectMonthlyProjection[]): ProjectMonthlyProjection[] {
    const monthly = monthlyProjections.sort((leftside, rightside): number => {
      if (leftside[key] < rightside[key]) { return -1; }
      if (leftside[key] > rightside[key]) { return 1; }
      return 0;
    });
    return monthly;

  }

  // figure out the available years
  findYears(projections: ProjectMonthlyProjection[]): Year[] {
    // make sure sorted by date.
    projections = this.sortProjections(projections);

    const years = new Array<Year>();

    let curYear = moment([1800]).year();

    for (const projection of projections) {
      const projYear = moment(projection.month).year();
      if (curYear < projYear) {
        const year = {
          value: projYear,
          selected: true,
          disabled: false
        };
        years.push(year);
        curYear = projYear;
      }
    }

    return years;
  }

  // update the selected values of this years filter
  // other filters may have filtered out 
  updateYearsFilter(projections: ProjectMonthlyProjection[]) {
    const filteredYears = this.findYears(projections);

    for (const year of this.years) {
      const index = filteredYears.findIndex(f => f.value === year.value);
      if (index < 0) {
        year.disabled = true;
        year.selected = false;
      } else {
        year.disabled = false;
        year.selected = true;
      }
    }
  }


  // 

  applyYearFilter(event?: any) {
    console.log('year fired');
  }

  // find what status are in the current list.
  findStatus(projections: ProjectMonthlyProjection[]): string[] {
    // sort by status.
    const curProjections = this.sortProjectionsByKey('statusName', projections);
    
    const curStatus = new Array<string>();
    let curStatusName  = '';

    for (const projection of curProjections) {
      const projStatusName = projection.statusName;
      if (curStatusName !== projStatusName) {
        curStatus.push(projStatusName);
        curStatusName = projStatusName;
      }
    }
    return curStatus;
  }

  // update the status filter
  updateStatusFilter(projections: ProjectMonthlyProjection[]) {
    const filteredStatus = this.findStatus(projections);

    for (const stat of this.status) {
      const index = filteredStatus.findIndex(statusName => statusName === stat.statusName);

      if (index < 0) {
        stat.selected = false;
        stat.disabled = true;
      } else {
        stat.selected = true;
        stat.disabled = false;
      }

    }
  }

  applyStatusFilter(status?: string) {
    let projections = new Array<ProjectMonthlyProjection>();
    const filteredProjections = new Array<ProjectMonthlyProjection>();

    // check if fired by user
    if (status === undefined) {
      // I am not the starting filter to use the current
      // partaily filter resutls
      projections = this.filteredProjections;
    } else {
      // start with me.  Start with the full list.
      projections = this.monthlyProjections;
    }

    // go through all of the projections to see if meet the filter.
    for (const projection of projections) {
      this.status.filter(s => s.selected).forEach(s => {
        if (s.statusName === projection.statusName) {
          filteredProjections.push(projection);
        }
      });
    }

    this.filteredProjections = filteredProjections;

    if (status !== undefined) {
      // this.applyYearFilter();
      // this.applyFilter();

      // regroup the months and redraw the chart.
      this.months = this.chartHelper.groupMonths(this.filteredProjections);
      this.convertData();
    } else {
      this.updateStatusFilter(this.filteredProjections);
    }
  }

  convertData() {
    this.data = this.chartHelper.convertData(this.months, this.viewCapValues, this.viewExpValues, 
        this.chartStartDate, undefined, this.budgets);
  }

}
