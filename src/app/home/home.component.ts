import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../shared/services/appointment.service';
import { Auth } from '@angular/fire/auth';
import { Appointment } from '../shared/models/appointment';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
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
      this.router.navigate(['/login']);
    }
  }

  agendarCita() {
    this.router.navigate(['/agendar']); // redirige a formulario de nueva cita
  }
}
