import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../shared/services/appointments/appointment.service';
import { AppointmentStatusEnum, UserRoleEnum } from '../../../shared/models/enums';
import { AuthService, Credentials } from '../../../shared/services/auth/auth.service';
import { AppointmentEmailParams } from '../../../shared/models/notifications';
import { Appointment } from '../../models/appointment';
import { UserService } from '../../../shared/services/users/user.service';
import { NotificationService } from '../../../shared/services/notification/notification.service';
import { DoctorProfile, PatientProfile } from '../../../shared/models/users';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-appointments',
  standalone: false,
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent {
  user: Credentials | null = null;
  showTreatmentDialog = false;

  constructor(
    private router: Router,
    public authService: AuthService,
    public appointmentService: AppointmentService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.getAppointments();
  }

  async getAppointments() {
    this.user = this.authService.getCurrentUser()!;

    if (!this.user) {
      return;
    }
    switch (this.user.role) {
      case UserRoleEnum.patient: {
        await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.patient);
        break;
      }
      case UserRoleEnum.doctor: {
        await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.doctor);
        break;
      }
      case UserRoleEnum.admin: {
        await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.admin);
        break;
      }

      default: {
        await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.patient);
        break;
      }
    }
  }

  async delete(cita: Appointment) {
    // Implementar lógica de eliminación de cita

    if (this.user === null) {
      Swal.fire({
        title: "No autenticado",
        text: "No se puede eliminar la cita, no existe un usuario autenticado",
        icon: "warning"
      });
      return;
    }
    let email: AppointmentEmailParams = {
      to_name: '',
      to_email: '',
      from_name: '',
      cita_fecha: '',
      cita_hora: '',
      accion: AppointmentStatusEnum.Confirmada,
      rol_actor: 'doctor',
      rol_receptor: 'doctor',
      razon_cancelacion: null,
      to_cc: null,
      title: ''
    }
    this.appointmentService.updateAppointmentStatus(cita.id, AppointmentStatusEnum.Cancelada)
    .then(async () => {
      if (!this.user) {
        return;
      }

      if( !cita.doctorId) {
        Swal.fire({
          title: "Sin doctor asignado",
          text: "No se puede eliminar la cita, no existe un doctor asignado",
          icon: "warning"
        });
        return;
      }

      const doctorResult = await this.userService.getUser(cita.doctorId, UserRoleEnum.doctor);
      if (!doctorResult || (doctorResult as DoctorProfile).email === undefined) {
        Swal.fire({
          title: "Sin doctor asignado",
          text: "No se puede eliminar la cita, no existe un doctor asignado",
          icon: "warning"
        });
        return;
      }
      const doctor: DoctorProfile = doctorResult as DoctorProfile;

      const patientResult = await this.userService.getUser(cita.userId, UserRoleEnum.patient);
      if (!patientResult || (patientResult as PatientProfile).email === undefined) {
        Swal.fire({
          title: "Sin paciente asignado",
          text: "No se puede eliminar la cita, no existe un doctor asignado",
          icon: "warning"
        });
        return;
      }
      const patient: PatientProfile = patientResult as PatientProfile;


      switch(this.user.role){

        case UserRoleEnum.patient : {        
          email = {
            to_name: doctor.name,
            to_email: doctor.email,
            to_cc: patient.email,
            from_name: patient.name || 'Usuario',
            cita_fecha: cita.date,
            cita_hora: cita.time,
            accion: AppointmentStatusEnum.Cancelada,
            rol_actor: 'paciente',
            rol_receptor: 'doctor',
            razon_cancelacion: null,
            title: 'Cancelada por el paciente'
          }
          break;
        }
        case UserRoleEnum.doctor : {
          email = {
            to_name: doctor.name,
            to_email: doctor.email,
            to_cc: patient.email,
            from_name: patient.name || 'Usuario',
            cita_fecha: cita.date,
            cita_hora: cita.time,
            accion: AppointmentStatusEnum.Cancelada,
            rol_actor: 'paciente',
            rol_receptor: 'doctor',
            razon_cancelacion: null,
            title: 'Cancelada por el médico'
          }

          await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.doctor);
          break;
        }
        case UserRoleEnum.admin : {
          email = {
            to_name: doctor.name,
            to_email: doctor.email,
            to_cc: `${patient.email}, ${this.user.email}`,
            from_name: patient.name || 'Usuario',
            cita_fecha: cita.date,
            cita_hora: cita.time,
            accion: AppointmentStatusEnum.Cancelada,
            rol_actor: 'paciente',
            rol_receptor: 'doctor',
            razon_cancelacion: null,
            title: 'Cancelada por el administrador'
          }
          await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.admin);
          break;
        }

        default : {
          await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.patient);
          break;
        }
      }

      this.notificationService.send(email);
      this.getAppointments();

      // Actualizar la lista de citas después de eliminar
    })
    .catch((error: { message: string; }) => {
      console.error('Error al eliminar la cita:', error);
      Swal.fire({
        title: "Error",
        text: "Error al eliminar la cita: " + error.message,
        icon: "error"
      });
    });
    


    
    
      this.notificationService.send(email)
          
  } 

  async confirm(cita: Appointment) {
    if (this.user === null) {
      Swal.fire({
        title: "No autenticado",
        text: "No se puede confirmar la cita, no existe un usuario autenticado",
        icon: "warning"
      });
      return;
    }
    let email: AppointmentEmailParams = {
      to_name: '',
      to_email: '',
      from_name: '',
      cita_fecha: '',
      cita_hora: '',
      accion: AppointmentStatusEnum.Confirmada,
      rol_actor: 'doctor',
      rol_receptor: 'doctor',
      razon_cancelacion: null,
      to_cc: null,
      title: ''
    };
    
    this.appointmentService.updateAppointmentStatus(cita.id, AppointmentStatusEnum.Confirmada)
      .then(async () => {
        if (!this.user) {
          return;
        }

        if (!cita.doctorId) {
          Swal.fire({
            title: "Sin doctor asignado",
            text: "No se puede confirmar la cita, no existe un doctor asignado",
            icon: "warning"
          });
          return;
        }

        const doctorResult = await this.userService.getUser(cita.doctorId, UserRoleEnum.doctor);
        if (!doctorResult || (doctorResult as DoctorProfile).email === undefined) {
          Swal.fire({
            title: "Sin doctor asignado",
            text: "No se puede confirmar la cita, no existe un doctor asignado",
            icon: "warning"
          });
          return;
        }
        const doctor: DoctorProfile = doctorResult as DoctorProfile;

        const patientResult = await this.userService.getUser(cita.userId, UserRoleEnum.patient);
        if (!patientResult || (patientResult as PatientProfile).email === undefined) {
          Swal.fire({
            title: "Sin paciente asignado",
            text: "No se puede confirmar la cita, no existe un paciente asignado",
            icon: "warning"
          });
          return;
        }
        const patient: PatientProfile = patientResult as PatientProfile;

        switch (this.user.role) {
          case UserRoleEnum.patient: {
            email = {
              to_name: doctor.name,
              to_email: doctor.email,
              to_cc: patient.email,
              from_name: patient.name || 'Usuario',
              cita_fecha: cita.date,
              cita_hora: cita.time,
              accion: AppointmentStatusEnum.Confirmada,
              rol_actor: 'paciente',
              rol_receptor: 'doctor',
              razon_cancelacion: null,
              title: 'Confirmada por el paciente'
            };
            break;
          }
          case UserRoleEnum.doctor: {
            email = {
              to_name: patient.name,
              to_email: patient.email,
              to_cc: doctor.email,
              from_name: doctor.name || 'Doctor',
              cita_fecha: cita.date,
              cita_hora: cita.time,
              accion: AppointmentStatusEnum.Confirmada,
              rol_actor: 'doctor',
              rol_receptor: 'paciente',
              razon_cancelacion: null,
              title: 'Confirmada por el médico'
            };
            await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.doctor);
            break;
          }
          case UserRoleEnum.admin: {
            email = {
              to_name: doctor.name,
              to_email: doctor.email,
              to_cc: `${patient.email}, ${this.user.email}`,
              from_name: patient.name || 'Usuario',
              cita_fecha: cita.date,
              cita_hora: cita.time,
              accion: AppointmentStatusEnum.Confirmada,
              rol_actor: 'admin',
              rol_receptor: 'doctor',
              razon_cancelacion: null,
              title: 'Confirmada por el administrador'
            };
            await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.admin);
            break;
          }
          default: {
            await this.appointmentService.getAppointmentsByUser(this.user.uid, UserRoleEnum.patient);
            break;
          }
        }

        this.notificationService.send(email);
        this.getAppointments();
      })
      .catch((error: { message: string }) => {
        console.error('Error al confirmar la cita:', error);
        Swal.fire({
          title: "Error",
          text: "Error al confirmar la cita: " + error.message,
          icon: "error"
        });
      });
  }
  agendarCita() {
    this.router.navigate(['appointment/create']); // redirige a formulario de nueva cita
  }
  createTreatment(id: string, userId: string) {
    this.router.navigate(['treatments/create', id, userId]);
  }
  editAppointment(id: string) {
    this.router.navigate(['appointment/edit', id]);
  }
  viewMedicalRecord(userId: string) {
    this.router.navigate(['/medical-record/record', userId]);
  }

}
