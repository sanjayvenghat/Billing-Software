import { TestBed } from '@angular/core/testing';

import { NoResultsFound } from './no-results-found';

describe('NoResultsFound', () => {
  let service: NoResultsFound;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoResultsFound);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
