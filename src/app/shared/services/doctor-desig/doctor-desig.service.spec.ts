import { TestBed } from '@angular/core/testing';

import { DoctorDesigService } from './doctor-desig.service';

describe('DoctorDesigService', () => {
  let service: DoctorDesigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoctorDesigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
