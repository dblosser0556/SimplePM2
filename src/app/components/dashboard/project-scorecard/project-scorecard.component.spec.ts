import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectScorecardComponent } from './project-scorecard.component';

describe('ProjectScorecardComponent', () => {
  let component: ProjectScorecardComponent;
  let fixture: ComponentFixture<ProjectScorecardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectScorecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
