import { TestBed } from '@angular/core/testing';

import { NewUser } from './new-user';

describe('NewUser', () => {
  let service: NewUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
