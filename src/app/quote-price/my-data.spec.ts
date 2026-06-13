import { TestBed } from '@angular/core/testing';

import { MyData } from './my-data';

describe('MyData', () => {
  let service: MyData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
