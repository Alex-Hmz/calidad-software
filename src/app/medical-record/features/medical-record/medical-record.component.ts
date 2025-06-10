import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../shared/services/users/user.service';
import { AppointmentTraceService } from '../../../shared/services/appointment-trace/appointment-trace.service';
import { AppointmentService } from '../../../shared/services/appointments/appointment.service';
import { TreatmentsService } from '../../../shared/services/treatments/treatments.service';
import { UserRoleEnum } from '../../../shared/models/enums';
import { DoctorProfile, PatientProfile } from '../../../shared/models/users';
import { Trace } from '../../../shared/models/appointment-trace';
import { Appointment } from '../../../appointment/models/appointment';
import { Treatment } from '../../../shared/models/treatments';

@Component({
  selector: 'app-medical-record',
  templateUrl: './medical-record.component.html',
  styleUrls: ['./medical-record.component.scss'],
  standalone: false
})
export class MedicalRecordComponent implements OnInit {
  patientId: string | null = null;
  patientInfo: PatientProfile | null = null;
  traces: Trace[] = [];
  appointments: Appointment[] = [];
  treatments: Treatment[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private traceService: AppointmentTraceService,
    private appointmentService: AppointmentService,
    private treatmentsService: TreatmentsService
  ) {}

  async ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (!this.patientId) {
      return;
    }
    this.loading = true;

    // Get patient info
    const user = await this.userService.getUser(this.patientId, UserRoleEnum.patient);
    this.patientInfo = user as PatientProfile;

    // Get traces
    await this.traceService.getAllByUser(this.patientId);
    this.traces = this.traceService.traces();

    // Get appointments
    await this.appointmentService.getAppointmentsByUser(this.patientId, UserRoleEnum.patient);
    this.appointments = [
      ...this.appointmentService.current_appointments(),
      ...this.appointmentService.future_appointments(),
      ...this.appointmentService.historic_appointments()
    ];

    // Get treatments
    await this.treatmentsService.getTreatmentsByUser(this.patientId);
    this.treatments = this.treatmentsService.treatments();

    this.loading = false;
  }
}
