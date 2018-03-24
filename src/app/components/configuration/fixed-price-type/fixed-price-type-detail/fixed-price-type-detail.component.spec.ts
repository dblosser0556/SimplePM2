import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCostTypeDetailComponent } from './project-cost-type-detail.component';

describe('ProjectCostTypeDetailComponent', () => {
  let component: ProjectCostTypeDetailComponent;
  let fixture: ComponentFixture<ProjectCostTypeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectCostTypeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCostTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
