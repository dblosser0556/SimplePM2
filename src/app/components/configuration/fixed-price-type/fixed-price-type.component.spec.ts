import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCostTypeComponent } from './project-cost-type.component';

describe('ProjectCostTypeComponent', () => {
  let component: ProjectCostTypeComponent;
  let fixture: ComponentFixture<ProjectCostTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectCostTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCostTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
