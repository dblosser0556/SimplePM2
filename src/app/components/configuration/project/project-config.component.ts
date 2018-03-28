import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../services';
import { Project, ProjectList, Status, Group, LoggedInUser } from '../../../models';
import { Observable } from 'rxjs/Observable';
import { StatusService } from '../status/status.service';
import { GroupService } from '../group/group.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import '../../../rxjs-extensions';

@Component({
  selector: 'app-project-config',
  templateUrl: './project-config.component.html',
  styleUrls: ['./project-config.component.scss']
})
export class ProjectConfigComponent implements OnInit {


  projects: ProjectList[];
  projectList: ProjectList[];
  templateList: ProjectList[];
  isTemplate = false;
  selectedProject: Project;
  groups: Group[] = [];
  status: Status[] = [];
  projectManagers: LoggedInUser[] = [];

  showDeleteConfirmation = false;

  error: any;
  isLoading = false;

  constructor(private projectService: ProjectService,
      private toast: ToastrService,
      private statusService: StatusService,
      private groupService: GroupService,
      private userService: UserService,
      private route: ActivatedRoute,
      private router: Router) {
  }

  ngOnInit() {
    this.getList();
    this.getGroupList();
    this.getStatusList();
    this.getPMList();
    this.getTemplateList();
  }

  confirmDelete(project: Project) {
    this.selectedProject = project;
    this.showDeleteConfirmation = true;
  }

  onDelete(id: number) {

      this.projectService.delete(this.selectedProject.projectId)
        .subscribe(x => {
          this.toast.success('Project has been deleted', 'Success');

          this.getList();
        },
        error => { this.toast.error(error, 'Oop Something went wrong');
                    console.log(error);
                  });
    
      }



  getList(): any {
    this.isLoading = true;
    this.selectedProject = undefined;
    this.route.queryParams.subscribe(
      params => {
        const queryParams = {...params.keys, ...params};
        if (params['$filter'] === 'IsTemplate eq true') {
          this.isTemplate = true;
        }
        this.projectService.getList(queryParams)
        .subscribe(results => {
          this.projects = results;
          this.isLoading = false;
        },
        error => { this.toast.error(error, 'Oop Something went wrong');
                    console.log(error);
                  });
      }
    );
  }

  getStatusList() {
    this.statusService.getOptionList().subscribe(
      results => this.status = results,
      error => { this.toast.error(error, 'Oop Something went wrong');
                    console.log(error);
                  });
  }

  getGroupList() {
    this.groupService.getOptionList().subscribe(
      results => this.groups = results,
      error => { this.toast.error(error, 'Oop Something went wrong');
                    console.log(error);
                  });
  }

  getPMList() {
    this.userService.getUserInRoles('editProjects').subscribe(
      results => { this.projectManagers = results; },
      error => { this.toast.error(error, 'Oop Something went wrong');
                    console.log(error);
                  });
  }

  getTemplateList() {
    const queryParams = { '$filter': 'IsTemplate eq true' };
    this.projectService.getList(queryParams).subscribe(
      results => this.templateList = results,
      error => { this.toast.error(error, 'Oop Something went wrong');
                    console.log(error);
                  });
  }

  add() {
    this.selectedProject = new Project();

  }

  edit(project: Project) {
    this.projectService.getOne(project.projectId).subscribe(
      res => this.selectedProject = res,
      error => { this.toast.error(error, 'Oop Something went wrong');
      console.log(error);
    });

  }

  updateList(event: any) {
    this.getList();
  }

  showDetails(id: number) {
    if (this.isTemplate) {
      this.router.navigate(['/configuration/project-templates/template'], { queryParams: { projectId: id } });
    } else {
      this.router.navigate(['/configuration/projects/project'], { queryParams: { projectId: id } });
    }

  }
}
