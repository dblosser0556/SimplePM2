import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ProjectService } from '../../services';
import { Project, Group, Status, LoggedInUser, ProjectList } from '../../models';
import { StatusService } from '../configuration/status/status.service';
import { GroupService } from '../configuration/group/group.service';
import { UtilityService } from '../../services/utility.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {


  currentProject: Project;
  groups: Group[];
  status: Status[];
  projectManagers: LoggedInUser[];
  templateList: ProjectList[];
  isTemplate: Boolean = false;

  detailsActive = true;
  forecastActive = false;
  actualsActive = false;
  vendorsActive = false;
  milestoneActive = false;

  isLoading = false;
  currentTab = 'Details';

  constructor(private projectService: ProjectService,
    private toast: ToastrService, private groupService: GroupService,
    private statusService: StatusService,
    private util: UtilityService,
    private userService: UserService,
    private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.isLoading = true;
    this.getPMList();
    this.getGroupList();
    this.getStatusList();
    this.getTemplateList();
    this.getProject();
  }



  getStatusList() {
    this.statusService.getOptionList().subscribe(
      results => this.status = results,
      error => {
        this.toast.error(error);
        console.log(error);
      });
  }

  getGroupList() {
    this.groupService.getOptionList().subscribe(
      results => this.groups = results,
      error => {
        this.toast.error(error);
        console.log(error);
      });
  }

  getPMList() {
    this.userService.getUserInRoles('editProjects').subscribe(
      results => this.projectManagers = results,
      error => {
        this.toast.error(error);
        console.log(error);
      });
  }

  getProject() {
    this.isLoading = true;
    this.route.queryParams
      .filter(params => params.projectId)
      .subscribe(params => {
        const id = params.projectId;
        if (id === '-1') {
          this.currentProject = new Project();
        } else {
          this.projectService.getOne(id).subscribe(
            results => {
              this.currentProject = new Project();
              this.currentProject = results;

              // fill in the names of the drop downs for diplay.
              for (const resource of this.currentProject.resources) {
                resource.roleName = this.util.findRoleName(resource.roleId);
                resource.resourceTypeName = this.util.findTypeName(resource.resourceTypeId);
              }
              for (const fixedCost of this.currentProject.fixedPriceCosts) {
                fixedCost.fixedPriceTypeName = this.util.findFixedPriceTypeName(fixedCost.fixedPriceTypeId);
                fixedCost.resourceTypeName = this.util.findTypeName(fixedCost.resourceTypeId);
              }

              for (const month of this.currentProject.months) {
                month.phaseName = this.util.findPhaseName(month.phaseId);
              }

            },
            error => {
              this.toast.error(error);
              console.log(error);
            }
          );
        }
        this.isLoading = false;
      });
  }
  getTemplateList() {
    const queryParams = { '$filter': 'IsTemplate eq true' };
    this.projectService.getList(queryParams).subscribe(
      results => this.templateList = results,
      error => {
        this.toast.error(error);
        console.log(error);
      }
    );

  }

   updateCurrentProject(project: Project) {
    this.currentProject = project;
  }

}
