import { TestBed, inject } from '@angular/core/testing';

import { GroupBudgetService } from './group-budget.service';

describe('GroupBudgetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupBudgetService]
    });
  });

  it('should be created', inject([GroupBudgetService], (service: GroupBudgetService) => {
    expect(service).toBeTruthy();
  }));
});
