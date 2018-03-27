import { Component, OnInit, Input } from '@angular/core';
import { Project, ProjectList } from '../../../models';

@Component({
  selector: 'app-project-card-summary',
  templateUrl: './project-card-summary.component.html',
  styleUrls: ['./project-card-summary.component.scss']
})
export class ProjectCardSummaryComponent implements OnInit {

  @Input() projectSummary: ProjectList;
  constructor() { }

  ngOnInit() {
  }

}
