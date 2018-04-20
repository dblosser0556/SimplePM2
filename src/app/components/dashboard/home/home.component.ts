import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { ProjectMilestone, FilterByKey, ProjectsByFilterKey, GroupBudget,
  Group, Month, ChartData, Milestone, ProjectList, Status } from '../../../models';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../services';
import { GroupService } from '../../configuration/group/group.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { MilestoneChartMilestone, MilestoneChartScaleLabel,  } from '../../milestone-chart/milestone-chart.component';
import { QueryParams } from '../projects/projects.component';
import { StatusService } from '../../configuration/status/status.service';


export interface MilestoneChartData {
  projectName: string;
  milestones: MilestoneChartMilestone[];
  labels: MilestoneChartScaleLabel[];
  barValues: MilestoneChartScaleLabel[];
  target: MilestoneChartMilestone;
  startDate: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoading = false;

  groups: Group[];
  projectList: ProjectList[];
  filteredProjects: ProjectList[];

  groupFilters: FilterByKey[] = [];
  yearFilters: FilterByKey[] = [];
  statusFilters: FilterByKey[] = [];

  projectsByGroup: ProjectsByFilterKey[] = [];
  projectsByStatus: ProjectsByFilterKey[] = [];
  projectsByYear: ProjectsByFilterKey[] = [];

  months: Month[] = [];
  dashboardStatus: Status[] = [];

  data: MilestoneChartData[] = [];
  budgets: GroupBudget[];

  years: FilterByKey[] = [];
  status: FilterByKey[] = [];

  viewCapValues = true;
  viewExpValues = true;

  title: string;
  showMilestones = true;



  constructor(private groupService: GroupService,
    private projectService: ProjectService,
    private statusService: StatusService,
    private toast: ToastrService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {

  }

  ngOnInit() {
    this.isLoading = true;

    this.getGroups();

  }


  // get the list of projects by with thier cost data by month.
  getProjects() {
    // create the string that represents the list of status that are configured to 
    // be in this view.
    let filterString = '';
    for (const _status of this.dashboardStatus) {
      if (filterString === '') {
        filterString = 'StatusName eq \'' + _status.statusName + '\'';
      } else {
        filterString += ' or StatusName eq \'' + _status.statusName + '\'';
      }
    }
    const _param: QueryParams = {$filter: filterString};

    this.projectService.getList(_param).subscribe( res => {
      this.projectList = res;
      this.filteredProjects = this.projectList;
      this.updateChart(this.projectList);
      this.isLoading = false;
    }, error => {
      this.toast.error('error', 'Oops - Retrieving Project Info');
      console.log('Retrieving - Monthly projects', error);
    });
  }

  // get all the groups and put them in a hierarchy.
  // the tp[] groups have a parent of 0
  getGroups() {
    this.isLoading = true;
    this.groupService.getAll().subscribe(results => {
      this.groups = results;
      this.getStatus();

    }, error => {
      this.toast.error('error', 'Oops - Retrieving Groups Info');
      console.log('Retrieving -  Retrieving Groups Info', error);
    });
  }

  getStatus() {
    this.statusService.getAll().subscribe(results => {
      this.dashboardStatus = results.filter(r => r.dashboard === true);
      this.getProjects();
    }, error => {
      this.toast.error('error', 'Oops - Retrieving Status Info');
      console.log('Retrieving -  Retrieving Status Info', error);
    });

  }


  updateChart(projectList: ProjectList[]) {
       // set the filter list for each filter component
       this.projectsByGroup = this.setProjectsByKey('groupName', projectList);
       this.projectsByStatus = this.setProjectsByKey('statusName', projectList);
       this.projectsByYear = this.setProjectsByKey('filterYear', projectList);
       this.filteredProjects = projectList;
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
    let filteredProjects = this.projectList;
    filteredProjects = this.filterByKey('groupName', this.groupFilters, filteredProjects);
    filteredProjects = this.filterByKey('filterYear', this.yearFilters, filteredProjects);
    filteredProjects = this.filterByKey('statusName', this.statusFilters, filteredProjects);

    this.updateChart(filteredProjects);

  }

  resetFilter() {
    this.updateChart(this.projectList);
  }



  // create a list of projects by key name
  // this is done for each filter type and passed to the filter
  // so they can keep track of there counts.
  setProjectsByKey(key: string, projects: ProjectList[]): ProjectsByFilterKey[] {

    const projectsByKey: ProjectsByFilterKey[] = [];
    let sortedMilestones = projects;
    sortedMilestones = _.chain(sortedMilestones).sortBy('projectName')
      .sortBy(key).value();

    let curProject = '';
    for (const project of sortedMilestones) {
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

  // sort the monthly projects




  // update the status filter
  filterByKey(key: string, filterKeys: FilterByKey[], projects: ProjectList[]):
      ProjectList[] {

        // ensure the filter has been set if not then return passed values
    if (filterKeys === undefined || filterKeys.length === 0) {
      return projects;
    }

    const filteredProjects: ProjectList[] = [];

    // go through each and make sure there is a match with one of the
    // selected keys.
    for (const project of projects) {
      for (const filter of filterKeys.filter(f => f.selected)) {
        if (filter.keyValue === project[key]) {
          filteredProjects.push(project);
        }
      }
    }
    return filteredProjects;
  }






}
