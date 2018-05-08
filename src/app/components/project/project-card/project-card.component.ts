import { Component, OnInit, Input } from '@angular/core';
import { ProjectList, Project, Status } from '../../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { StatusService } from '../../../services';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  statusList: Status[] = [];
  hasStartError: boolean;
  hasStartDateError: boolean;
  hasStartDate: any;
  hasStatusError: boolean;
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
    private projectService: ProjectService,
    private statusService: StatusService,
    private toast: ToastrService) {
      this.showView = 'summary';
     }


  ngOnInit() {
    this.isLoading = true;
    this.statusService.getAll().subscribe(status => {
      this.statusList = status;
      this.projectService.getOne(this.projectSummary.projectId).subscribe(
        res => {
          this.project = res;
          this.checkErrors();
          if (this.showMilestones) {
            this.showView = 'chart';
          }
          this.isLoading = false;
        }, error => {
          console.log(error);
        }
      );
    });
  }

  checkErrors() {
    // set up all of the warning flags.

    if (this.project.actualStartDate !== null) {
      this.hasStartDate = true;
    } else {
      this.hasStartDate = false;
    }

    const today = moment();
    if (!this.hasStartDate && moment(this.project.plannedStartDate).isBefore(today)) {
      this.hasStartError = true;
    } else {
      this.hasStartError = false;
    }
    const statusType: Status = this.statusList.find(s => s.statusId === this.project.statusId);

    if (this.hasStartDate && !statusType.dashboard) {
      this.hasStartDateError = true;
    } else {
      this.hasStartDateError = false;
    }

    if (!this.hasStartDate && statusType.dashboard) {
      this.hasStatusError = true;
    } else {
      this.hasStatusError = false;
    }
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
