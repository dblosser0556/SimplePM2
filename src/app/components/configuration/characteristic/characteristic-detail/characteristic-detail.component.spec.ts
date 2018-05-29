import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacteristicDetailComponent } from './characteristic-detail.component';

describe('CharacteristicDetailComponent', () => {
  let component: CharacteristicDetailComponent;
  let fixture: ComponentFixture<CharacteristicDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacteristicDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
