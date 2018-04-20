import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneChartComponent } from './milestone-chart.component';

describe('MilestoneChartComponent', () => {
  let component: MilestoneChartComponent;
  let fixture: ComponentFixture<MilestoneChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestoneChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestoneChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
