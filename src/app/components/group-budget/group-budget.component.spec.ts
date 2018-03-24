import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupBudgetComponent } from './group-budget.component';

describe('GroupBudgetComponent', () => {
  let component: GroupBudgetComponent;
  let fixture: ComponentFixture<GroupBudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
