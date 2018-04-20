import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMilestoneChartComponent } from './project-milestone-chart.component';

describe('ProjectMilestoneChartComponent', () => {
  let component: ProjectMilestoneChartComponent;
  let fixture: ComponentFixture<ProjectMilestoneChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectMilestoneChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMilestoneChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
