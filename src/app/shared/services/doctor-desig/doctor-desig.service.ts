import { Injectable } from '@angular/core';
import { collection, CollectionReference, Firestore } from '@angular/fire/firestore';
import { UserService } from '../users/user.service';
import { CreateDoctorProfile, DoctorProfile } from '../../models/users';
import { AuthService } from '../auth/auth.service';
import { UserRoleEnum } from '../../models/enums';
import { CreateAsignDoctorToAppointment } from '../../../appointment/models/appointment';
import { AppointmentService } from '../appointments/appointment.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DoctorDesigService {

  private taracesRef: CollectionReference;

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private authService: AuthService,
    private appointmentService: AppointmentService
    
  ) {
    this.taracesRef = collection(this.firestore, 'users');
  //     const fixedMockDoctors: CreateDoctorProfile[] = [
  //   {
  //     name: 'Dra. Fernanda López',
  //     email: 'fernanda.lopez@clinicapp.com',
  //     birthdate: new Date('1985-06-10'),
  //     phone: '5512345678',
  //     address: 'Av. Reforma 123, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'IPHtUZ4TnIrOAnQRCvGu', // Ginecología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dr. Jorge Martínez',
  //     email: 'jorge.martinez@clinicapp.com',
  //     birthdate: new Date('1979-11-20'),
  //     phone: '5598765432',
  //     address: 'Insurgentes Sur 404, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: '8coQoXzrZXayVTzLiLVV', // Medicina General
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dra. Mariana Ruiz',
  //     email: 'mariana.ruiz@clinicapp.com',
  //     birthdate: new Date('1990-03-18'),
  //     phone: '5587654321',
  //     address: 'Col. Del Valle, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'lnyjOQLJ90GMyjv4ddzR', // Dermatología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dr. Héctor Sánchez',
  //     email: 'hector.sanchez@clinicapp.com',
  //     birthdate: new Date('1982-08-02'),
  //     phone: '5543216789',
  //     address: 'Coyoacán, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'FA0exkPh8vWiqtCfPSeu', // Cardiología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dra. Laura Castillo',
  //     email: 'laura.castillo@clinicapp.com',
  //     birthdate: new Date('1988-12-25'),
  //     phone: '5577889922',
  //     address: 'Narvarte, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'I2oxnp9VkLyQbxU6eAlD', // Nutrición
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dr. Carlos Navarro',
  //     email: 'carlos.navarro@clinicapp.com',
  //     birthdate: new Date('1975-04-30'),
  //     phone: '5556677889',
  //     address: 'Azcapotzalco, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: '4vOkDLYQGYBEeu5NPYyb', // Pediatría
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dra. Alejandra Torres',
  //     email: 'alejandra.torres@clinicapp.com',
  //     birthdate: new Date('1992-07-15'),
  //     phone: '5533445566',
  //     address: 'Roma Norte, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'n8VYjdIylutGDLnIxQcN', // Psicología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dr. Luis Mendoza',
  //     email: 'luis.mendoza@clinicapp.com',
  //     birthdate: new Date('1983-01-21'),
  //     phone: '5599334455',
  //     address: 'Centro Histórico, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'BYjT3uQ4BCiwLD1zzERS', // Odontología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dra. Gabriela Paredes',
  //     email: 'gabriela.paredes@clinicapp.com',
  //     birthdate: new Date('1995-09-12'),
  //     phone: '5566778899',
  //     address: 'Santa María la Ribera, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'miD2MgSXvv6S5gabLkvu', // Oftalmología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dr. Enrique Rojas',
  //     email: 'enrique.rojas@clinicapp.com',
  //     birthdate: new Date('1980-05-05'),
  //     phone: '5544556677',
  //     address: 'Lindavista, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'KTGDIYimPIjdIcluhdZF', // Otorrinolaringología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dra. Paola Vázquez',
  //     email: 'paola.vazquez@clinicapp.com',
  //     birthdate: new Date('1991-10-10'),
  //     phone: '5522113344',
  //     address: 'San Ángel, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'KpmbQcy4UrtYuHxAiRYe', // Traumatología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dr. Ricardo Díaz',
  //     email: 'ricardo.diaz@clinicapp.com',
  //     birthdate: new Date('1986-03-03'),
  //     phone: '5533557799',
  //     address: 'Polanco, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: '8coQoXzrZXayVTzLiLVV', // Medicina General
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dra. Mónica Herrera',
  //     email: 'monica.herrera@clinicapp.com',
  //     birthdate: new Date('1993-11-11'),
  //     phone: '5544992211',
  //     address: 'Mixcoac, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'lnyjOQLJ90GMyjv4ddzR', // Dermatología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dr. Alan Ortega',
  //     email: 'alan.ortega@clinicapp.com',
  //     birthdate: new Date('1978-09-01'),
  //     phone: '5556667788',
  //     address: 'Tláhuac, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'FA0exkPh8vWiqtCfPSeu', // Cardiología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   },
  //   {
  //     name: 'Dra. Rebeca Morales',
  //     email: 'rebeca.morales@clinicapp.com',
  //     birthdate: new Date('1989-04-17'),
  //     phone: '5522334455',
  //     address: 'Xochimilco, CDMX',
  //     role: UserRoleEnum.doctor,
  //     createdAt: new Date(),
  //     isActive: true,
  //     isFirstLogin: true,
  //     specialty: 'n8VYjdIylutGDLnIxQcN', // Psicología
  //     dailyAppointments: 8,
  //     schechule: { start: '09:00', end: '17:00' }
  //   }
  // ];

    
  //   this.createMockDoctors(fixedMockDoctors);
  }

  private async createMockDoctors(mockDoctors: CreateDoctorProfile[]) {
    for (const doctor of mockDoctors) {
      try {
        const user = await this.authService.register(doctor.email, '123456', UserRoleEnum.doctor);
        const success = await this.authService.createUserProfile(user.uid, doctor);

      } catch (error) {
        console.error('Error creating mock doctor:', doctor.name, error);
      }
    }
  }

  async isDoctorAvailableToAppointment(assignAppoint: CreateAsignDoctorToAppointment ): Promise<{doctor:DoctorProfile | null}> {
    try {
      const possibleDoctors = await this.userService.getDoctorsBySpecialtyAndAvaility(
        assignAppoint.typeId,
        assignAppoint.time
      );

      if (!possibleDoctors || possibleDoctors.length === 0) {
        throw new Error("No se encontraron doctores disponibles con la especialidad y hora seleccionadas.");
        
      }

      for (const doctor of possibleDoctors) {

        const isAvailable = await this.appointmentService.getIsDoctorAvailableToAppointment(
          doctor.id,
          assignAppoint.date,
          assignAppoint.time
        );
        if (!isAvailable) {
          continue; // Skip to the next doctor if this one is not available
        }

        const appointmentCount = await this.appointmentService.getTotalAppointmentsByDoctorAndDate(
          doctor.id,
          assignAppoint.date
        );

        if (appointmentCount < doctor.dailyAppointments) {

          return { doctor };
        }
      }
      
      throw new Error("Todos los doctores disponibles ya tienen sus citas completas para el día seleccionado.");

    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error al asignar doctor a la cita: " + error,
        icon: "error"
      });
      return { doctor:null };
    }
  }
}
