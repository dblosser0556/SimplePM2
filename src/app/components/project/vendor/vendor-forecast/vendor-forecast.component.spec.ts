import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorForecastComponent } from './vendor-forecast.component';

describe('VendorForecastComponent', () => {
  let component: VendorForecastComponent;
  let fixture: ComponentFixture<VendorForecastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorForecastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
