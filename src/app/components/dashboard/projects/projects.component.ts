import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService, UserService } from '../../../services';
import { ProjectList } from '../../../models';

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

  constructor(private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService) {
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
        });
      }
    );
  }

}
