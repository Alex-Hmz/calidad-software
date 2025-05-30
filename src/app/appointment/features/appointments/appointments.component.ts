import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Appointment } from '../../../shared/models/appointment';
import { AppointmentService } from '../../../shared/services/appointment.service';

@Component({
  selector: 'app-appointments',
  standalone: false,
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent {
 citasActuales: Appointment[] = [];
  historialCitas: Appointment[] = [];

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private auth: Auth
  ) {}

  async ngOnInit(): Promise<void> {
    const user = this.auth.currentUser;

    if (user) {
      const { actuales, historico } = await this.appointmentService.getAppointmentsByUser(user.uid);
      this.citasActuales = actuales;
      this.historialCitas = historico;
    } else {
      // Si no hay usuario, redirige al login o muestra mensaje
      this.router.navigate(['/auth/login']);
    }
  }

  agendarCita() {
    this.router.navigate(['/agendar']); // redirige a formulario de nueva cita
  }
}
