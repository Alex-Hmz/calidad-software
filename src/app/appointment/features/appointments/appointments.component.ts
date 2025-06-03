import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../../models/appointment';
import { AppointmentService } from '../../data-access/appointment.service';
import { AuthService } from '../../../auth/features/data-access/auth.service';
import { AppointmentStatusEnum } from '../../../shared/models/enums';

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
    private _authService: AuthService,
    public appointmentService: AppointmentService
  ) {
  }
  

  async ngOnInit(): Promise<void> {

    this.getAppointments();


  }

  async getAppointments() {
    const user = this._authService.getCurrentUser();
    console.log('Usuario actual:', user);
    console.log(this.appointmentService.error);
    
    if (user) {
      await this.appointmentService.getAppointmentsByUser(user.uid);
      console.log('Citas actuales:', this.appointmentService.current_appointments());
      console.log('Historial de citas:', this.appointmentService.historic_appointments());
      
    } else {
      // Si no hay usuario, redirige al login o muestra mensaje
      this.router.navigate(['/auth/login']);
    } 
  }

  async delete(id:string) {
    // Implementar lógica de eliminación de cita
    this.appointmentService.updateAppointmentStatus(id, AppointmentStatusEnum.Cancelada)
    .then(() => {
      this.getAppointments();

      // Actualizar la lista de citas después de eliminar
    })
    .catch((error: { message: string; }) => {
      console.error('Error al eliminar la cita:', error);
      alert('Error al eliminar la cita: ' + error.message);
    });
    
    console.log('Eliminar cita' + id);
  } 

  agendarCita() {
    this.router.navigate(['appointment/create']); // redirige a formulario de nueva cita
  }
}
