import { Component, OnInit, OnChanges, ElementRef, HostListener } from '@angular/core';
import { GroupService , StatusService } from '../../../services';
import { Status, Group, GroupTreeView, ProjectMonthlyProjection,
  ChartData, Month, Budget, GroupBudget, ProjectsByFilterKey, FilterByKey } from '../../../models';
import { ProjectMonthlyProjectionService } from '../../../services/project-monthly-projection.service';
import { ChartHelperService } from '../../../services';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';



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

  groupFilters: FilterByKey[] = [];
  yearFilters: FilterByKey[] = [];
  statusFilters: FilterByKey[] = [];

  projectsByGroup: ProjectsByFilterKey[] = [];
  projectsByStatus: ProjectsByFilterKey[] = [];
  projectsByYear: ProjectsByFilterKey[] = [];

  rootGroups: Group[] = [];

  months: Month[] = [];


  data: ChartData[] = [];
  budgets: GroupBudget[];
  chartStartDate: string;

  years: FilterByKey[] = [];
  status: FilterByKey[] = [];

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

  }


  // set the size of the chart based on the available view window.
  getChartView() {
    const height = window.innerHeight - this.el.nativeElement.offsetTop - 120;
    const width = this.el.nativeElement.parentElement.clientWidth;

    const nav = this.el.nativeElement.parentElement.querySelector('.sidenav');
    this.view = [width - nav.parentElement.clientWidth - 120, height];
  }

  // get the list of projects by with thier cost data by month.
  getProjects() {
    this.isLoading = true;
    this.monthlyService.getAll().subscribe(results => {

      this.monthlyProjections = this.sortProjections(results);
      this.filteredProjections = this.monthlyProjections;
      this.updateChart(this.monthlyProjections);
      this.isLoading = false;
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

  updateChart(projections: ProjectMonthlyProjection[]) {
       // set the filter list for each filter component
       this.projectsByGroup = this.setProjectsByKey('groupName', projections);
       this.projectsByStatus = this.setProjectsByKey('statusName', projections);
       this.projectsByYear = this.setProjectsByKey('year', projections);

       // group the monthly projects by month for display.
       this.months = this.chartHelper.groupMonths(projections);

       // set the start date of all the data.
       this.chartStartDate = moment(projections[0].startDate).format('YYYY-MM');
       this.convertData();

  }

  changeYearFilter(event: FilterByKey[]) {
    console.log('change year fired');
    this.yearFilters = event;
    this.updateFilteredData();
  }

  changeStatusFilter(event: FilterByKey[]) {
    console.log('change filter fired');
    this.statusFilters = event;
    this.updateFilteredData();
  }

  changeGroupFilter(event: FilterByKey[]) {
    console.log('change group fired');
    this.groupFilters = event;
    this.updateFilteredData();
  }

  updateFilteredData() {
    let filteredProjections = this.monthlyProjections;
    filteredProjections = this.filterByKey('groupName', this.groupFilters, filteredProjections);
    filteredProjections = this.filterByKey('year', this.yearFilters, filteredProjections);
    filteredProjections = this.filterByKey('statusName', this.statusFilters, filteredProjections);

    this.updateChart(filteredProjections);

  }

  resetFilter() {
    this.updateChart(this.monthlyProjections);
  }

  groupBudgets(groups: Group[]): GroupBudget[] {
    // WORKHERE
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

  // create a list of projects by key name
  // this is done for each filter type and passed to the filter
  // so they can keep track of there counts.
  setProjectsByKey(key: string, projections: ProjectMonthlyProjection[]): ProjectsByFilterKey[] {

    const projectsByKey: ProjectsByFilterKey[] = [];
    let sortedMonthlyProjects = projections;
    sortedMonthlyProjects = _.chain(sortedMonthlyProjects).sortBy('projectName')
      .sortBy(key).value();

    let curProject = '';
    for (const project of sortedMonthlyProjects) {
      if (project.projectName !== curProject) {
        const projectByKey = {
          keyValue: project[key],
          projectName: project.projectName
        };
        projectsByKey.push(projectByKey);
        curProject = project.projectName;
      }
    }
    return projectsByKey;
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



  // update the status filter
  filterByKey(key: string, filterKeys: FilterByKey[], projections: ProjectMonthlyProjection[]):
      ProjectMonthlyProjection[] {

        // ensure the filter has been set if not then return passed values
    if (filterKeys === undefined || filterKeys.length === 0) {
      return projections;
    }

    const filteredProjections: ProjectMonthlyProjection[] = [];

    // go through each and make sure there is a match with one of the
    // selected keys.
    for (const projection of projections) {
      for (const filter of filterKeys.filter(f => f.selected)) {
        if (filter.keyValue === projection[key]) {
          filteredProjections.push(projection);
        }
      }
    }
    return filteredProjections;
  }




  convertData() {
    this.data = this.chartHelper.convertData(this.months, this.viewCapValues, this.viewExpValues,
      this.chartStartDate, undefined, this.budgets);
  }

}
