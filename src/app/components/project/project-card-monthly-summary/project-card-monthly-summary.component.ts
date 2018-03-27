import { Component, OnInit, Input } from '@angular/core';
import { Project, ProjectList } from '../../../models';
import { ProjectService } from '../../../services';

@Component({
  selector: 'app-project-card-monthly-summary',
  templateUrl: './project-card-monthly-summary.component.html',
  styleUrls: ['./project-card-monthly-summary.component.scss']
})
export class ProjectCardMonthlySummaryComponent implements OnInit {
  @Input() project: Project;
  @Input() projectSummary: ProjectList;
  constructor(private projectService: ProjectService) { }

  ngOnInit() {
  }

}
