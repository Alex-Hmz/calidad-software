import { TestBed } from '@angular/core/testing';

import { AppointmentTraceService } from './appointment-trace.service';

describe('AppointmentTraceService', () => {
  let service: AppointmentTraceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentTraceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
