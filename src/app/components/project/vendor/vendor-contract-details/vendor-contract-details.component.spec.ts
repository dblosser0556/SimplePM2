import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorContractDetailsComponent } from './vendor-contract-details.component';

describe('VendorContractDetailsComponent', () => {
  let component: VendorContractDetailsComponent;
  let fixture: ComponentFixture<VendorContractDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorContractDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorContractDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
