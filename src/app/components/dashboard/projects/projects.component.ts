import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService, UserService } from '../../../services';
import { ProjectList, ProjectsByFilterKey, FilterByKey, Group } from '../../../models';
import * as _ from 'lodash';
import { GroupService } from '../../configuration/group/group.service';

export interface QueryParams {
  $filter: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  projectList: ProjectList[] = [];
  allowEdit = false;
  queryParams: any;

  groups: Group[];
  filteredProjects: ProjectList[];

  groupFilters: FilterByKey[] = [];
  yearFilters: FilterByKey[] = [];
  statusFilters: FilterByKey[] = [];

  projectsByGroup: ProjectsByFilterKey[] = [];
  projectsByStatus: ProjectsByFilterKey[] = [];
  projectsByYear: ProjectsByFilterKey[] = [];


  constructor(private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private groupService: GroupService) {
      if (router.url === '/dashboard/myprojects') {
        this.allowEdit = true;
      }

    }

  ngOnInit() {
    //  get the query paramaters from the route
    this.getQueryParam();


  }


  getQueryParam(): any {
    this.route.queryParams.subscribe(
      params => {
        this.queryParams = {...params.keys, ...params};

        if (this.allowEdit) {
          const _param: QueryParams = {$filter: 'ProjectManager eq \'0f2e9bd6-5e33-4511-ac61-83b7c662a486\''};
          this.queryParams = _param;
        }
        this.projectService.getList(this.queryParams).subscribe( res => {
          this.projectList = res;
          this.filteredProjects = this.projectList;
          this.getGroups();
        });
      }
    );
  }

   // get all the groups and put them in a hierarchy.
  // the tp[] groups have a parent of 0
  getGroups() {
    this.groupService.getAll().subscribe(results => {
      this.groups = results;
      this.updateChart(this.projectList);
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
