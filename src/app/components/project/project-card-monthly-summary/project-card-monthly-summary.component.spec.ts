import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCardMonthlySummaryComponent } from './project-card-monthly-summary.component';

describe('ProjectCardMonthlySummaryComponent', () => {
  let component: ProjectCardMonthlySummaryComponent;
  let fixture: ComponentFixture<ProjectCardMonthlySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectCardMonthlySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCardMonthlySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
