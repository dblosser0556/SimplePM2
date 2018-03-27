import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCardModalComponent } from './project-card-modal.component';

describe('ProjectCardModalComponent', () => {
  let component: ProjectCardModalComponent;
  let fixture: ComponentFixture<ProjectCardModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectCardModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
