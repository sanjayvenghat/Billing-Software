import { TestBed } from '@angular/core/testing';

import { Billingservice } from './billingservice';

describe('Billingservice', () => {
  let service: Billingservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Billingservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
