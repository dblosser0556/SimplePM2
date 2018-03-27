import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMonthlyDetailComponent } from './project-monthly-detail.component';

describe('ProjectMonthlyDetailComponent', () => {
  let component: ProjectMonthlyDetailComponent;
  let fixture: ComponentFixture<ProjectMonthlyDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectMonthlyDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMonthlyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
