import { TestBed } from '@angular/core/testing';

import { MeiliService } from './meili.service';

describe('MeiliService', () => {
  let service: MeiliService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeiliService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
