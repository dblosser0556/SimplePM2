import { Component, OnInit } from '@angular/core';
import { ProjectList, FilterByKey, ProjectsByFilterKey, Group, QueryParams } from '../../../models';
import { GroupService } from '../../configuration/group/group.service';
import { ProjectService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { StatusService } from '../../configuration/status/status.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-project-scorecard',
  templateUrl: './project-scorecard.component.html',
  styleUrls: ['./project-scorecard.component.scss']
})
export class ProjectScorecardComponent implements OnInit {

  groupFilters: FilterByKey[];
  statusFilters: FilterByKey[];
  yearFilters: FilterByKey[];

  projectsByYear: ProjectsByFilterKey[];
  projectsByStatus: ProjectsByFilterKey[];
  projectsByGroup: ProjectsByFilterKey[];

  groups: Group[] = [];
  dashboardStatus: any;
  isLoading: boolean;
  filteredProjects: ProjectList[] = [];
  projectList: ProjectList[] = [];

  constructor(
    private groupService: GroupService,
    private projectService: ProjectService,
    private statusService: StatusService,
    private toast: ToastrService
  ) { }

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
    this.yearFilters = event;
    this.updateFilteredData();
  }

  changeStatusFilter(event: FilterByKey[]) {
    this.statusFilters = event;
    this.updateFilteredData();
  }

  changeGroupFilter(event: FilterByKey[]) {
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
