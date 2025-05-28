import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../shared/services/appointment.service';
import { Auth } from '@angular/fire/auth';
import { Appointment } from '../shared/models/appointment';

@Component({
  selector: 'app-appointment',
  standalone: false,
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.scss'
})
export class AppointmentComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private auth: Auth
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {}

  async submit() {
    if (!this.auth.currentUser) {
      alert('Debes iniciar sesión para agendar una cita');
      return;
    }

    const { date, time, reason } = this.form.value;
    const appointment: Appointment = {
      userId: this.auth.currentUser.uid,
      estado: 'Pendiente',
      date,
      time,
      reason,
      createdAt: Date.now()
    };

    try {
      await this.appointmentService.createAppointment(appointment);
      alert('Cita agendada exitosamente');
      this.form.reset();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }
}