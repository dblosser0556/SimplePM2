import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailByMonthComponent } from './project-detail-by-month.component';

describe('ProjectDetailByMonthComponent', () => {
  let component: ProjectDetailByMonthComponent;
  let fixture: ComponentFixture<ProjectDetailByMonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDetailByMonthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailByMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
