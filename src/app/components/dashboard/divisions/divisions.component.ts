import { Component, OnInit, OnChanges, ElementRef, HostListener } from '@angular/core';
import { StatusService } from '../../configuration/status/status.service';
import { GroupService } from '../../configuration/group/group.service';
import { Status, Group, GroupTreeView, ProjectMonthlyProjection, ChartData, Month, Budget, GroupBudget } from '../../../models';
import { ProjectMonthlyProjectionService } from '../../../services/project-monthly-projection.service';
import { ChartHelperService } from '../../../services';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';

export interface Filter {
  value: string;
  selected: boolean;
  disabled: boolean;
  unfilteredCount: number;
  filteredCount: number;
}

@Component({
  selector: 'app-divisions',
  templateUrl: './divisions.component.html',
  styleUrls: ['./divisions.component.scss']
})

export class DivisionsComponent implements OnInit, OnChanges {
  isLoading = false;

  groups: Group[];
  monthlyProjections: ProjectMonthlyProjection[];
  filteredProjections: ProjectMonthlyProjection[];

  treeviewGroups: GroupTreeView[] = [];
  rootGroups: Group[] = [];

  months: Month[] = [];


  data: ChartData[] = [];
  budgets: GroupBudget[];
  chartStartDate: string;

  years: Filter[] = [];
  status: Filter[] = [];

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
    private el: ElementRef,
    private toast: ToastrService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getChartView();
  }

  ngOnInit() {
    this.isLoading = true;

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

      // setup up the status filter
      this.getStatus();


    }, error => {
      this.toast.error('error', 'Oops - Retrieving Project Info');
      console.log('Retrieving - Monthly Projections', error);
    });
  }

  // get all the groups and put them in a hierarchy.
  // the tp[] groups have a parent of 0
  getGroups() {
    this.groupService.getAll().subscribe(results => {
      this.groups = results;

      // set the preliminary budgets base on the root groups.
      this.rootGroups = this.groups.filter(g => g.parentId === 0);
      this.budgets = this.groupBudgets(this.rootGroups);

      this.getProjects();

    });
  }

  getStatus() {
    this.statusService.getAll().subscribe(results => {
      const status: Status[] = results;
      const filterStatus = this.findStatus(this.monthlyProjections);

      // status is the superlist so go through each 
      // and compare to the ones in the list of projects.
      status.forEach(s => {
        const foundStatus = filterStatus.filter(f => f.value === s.statusName);
        if (foundStatus.length > 0) {
          this.status.push(foundStatus[0]);
        } else {
          const newStatus = {
            value: s.statusName,
            selected: false,
            disabled: true,
            filteredCount: 0,
            unfilteredCount: 0
          };
          this.status.push(newStatus);
        }
      });
      // set up the chartdata
      this.convertData();
      this.isLoading = false;
    }, error => {
      this.toast.error('error', 'Oops - Retrieving Status');
      console.log('Retrieving - Status', error);
    });
  }


  applyFilter(treeviewGroups: GroupTreeView[]) {
    this.treeviewGroups = treeviewGroups;
    console.log('fired');
  }


  groupBudgets(groups: Group[]): GroupBudget[] {
    const budgets = new Array<GroupBudget>();
    for (const group of groups) {
      // the group budgets are by year and not in any particular order.

     
        if (group.groupBudgets !== undefined) {
          for (const groupBudget of group.groupBudgets) {
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
    
    return budgets;

  }

  showCapChart() {
    // this.viewCapValues = !this.viewCapValues;
    this.convertData();
  }

  showExpChart() {
    // this.viewExpValues = !this.viewExpValues;
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
  findYears(projections: ProjectMonthlyProjection[]): Filter[] {
    let projectionsByDate = projections;
    // make sure sorted by date.
    projectionsByDate = _.chain(projections).sortBy('projectName')
      .sortBy('month')
      .value();

    const years = new Array<Filter>();

    let curYear = moment(projectionsByDate[0].month).year();
    let curProjectName = projectionsByDate[0].projectName;
    let projectCount = 1;
    for (const projection of projectionsByDate) {
      const projYear = moment(projection.month).year();
      if (curYear < projYear) {
        const year = {
          value: curYear.toString(),
          selected: true,
          disabled: false,
          unfilteredCount: projectCount,
          filteredCount: projectCount
        };
        years.push(year);
        curYear = projYear;
        projectCount = 1;
        curProjectName = projection.projectName;
      }
      if (curProjectName !== projection.projectName) {
        projectCount++;
      }
    }
    // handle the last year.
    const lastYear = {
      value: curYear.toString(),
      selected: true,
      disabled: false,
      unfilteredCount: projectCount,
      filteredCount: projectCount
    };
    years.push(lastYear);


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




  applyYearFilter(event?: any) {
    console.log('year fired');
  }

  // find what status are in the current list.
  findStatus(projections: ProjectMonthlyProjection[]): Filter[] {
    // sort by status. (Create clone so we don't sort the main list.)
    let curProjections = projections;
    curProjections = _.chain(curProjections).sortBy('projectName')
      .sortBy('statusName')
      .value();
    // then sort by projectName
    // curProjections = this.sortProjectionsByKey('projectName', curProjections);
    const curStatus = new Array<Filter>();
    let curStatusName = curProjections[0].statusName;
    let curProjectname = curProjections[0].projectName;
    let statusCount = 1;
    for (const projection of curProjections) {
      const projStatusName = projection.statusName;
      if (curStatusName !== projStatusName) {
        const newStatus = {
          value: curStatusName,
          selected: true,
          disabled: false,
          unfilteredCount: statusCount,
          filteredCount: statusCount
        };
        curStatus.push(newStatus);
        statusCount = 1;
        curStatusName = projStatusName;
        curProjectname = projection.projectName;
      }
      if (curProjectname !== projection.projectName) {
        statusCount++;
        curProjectname = projection.projectName;
      }
    }
    // add last
    const lastStatus = {
      value: curStatusName,
      selected: true,
      disabled: false,
      unfilteredCount: statusCount,
      filteredCount: statusCount
    };
    curStatus.push(lastStatus);
    return curStatus;
  }

  // update the status filter
  updateStatusFilter(projections: ProjectMonthlyProjection[]) {
    const filteredStatus = this.findStatus(projections);

    for (const stat of this.status) {
      const index = filteredStatus.findIndex(f => f.value === stat.value);

      if (index < 0) {
        stat.selected = false;
        stat.filteredCount = 0;
      } else {
        stat.selected = true;
        stat.filteredCount = filteredStatus[index].filteredCount;
      }

    }
  }

  applyStatusFilter(status?: Filter) {
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
        if (s.value === projection.statusName) {
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
      this.updateStatusFilter(this.filteredProjections);
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
