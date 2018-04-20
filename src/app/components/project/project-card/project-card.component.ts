import { Component, OnInit, Input } from '@angular/core';
import { ProjectList, Project } from '../../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../services';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  @Input() projectSummary: ProjectList;
  @Input() allowEdit: boolean;
  @Input() showMilestones = false;

  isLoading = false;


  showCap = true;
  showExp = true;

  project: Project;
  view = 'summary';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService) {
      this.showView = 'summary';
     }


  ngOnInit() {
    this.isLoading = true;
    this.projectService.getOne(this.projectSummary.projectId).subscribe(
      res => {
        this.project = res;
        if (this.showMilestones) {
          this.showView = 'chart';
        }
        this.isLoading = false;
      }, error => {
        console.log(error);
      }
    );
  }


  editDetails(id: number) {
    this.router.navigate(['./project'], { queryParams: { projectId: id },  relativeTo: this.route });
  }

  get showView() {
    return this.view;
  }

  set showView(value: string) {
    this.view = value;
  }
}
