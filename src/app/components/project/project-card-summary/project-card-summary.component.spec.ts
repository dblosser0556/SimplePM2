import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCardDetailsComponent } from './project-card-details.component';

describe('ProjectCardDetailsComponent', () => {
  let component: ProjectCardDetailsComponent;
  let fixture: ComponentFixture<ProjectCardDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectCardDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
