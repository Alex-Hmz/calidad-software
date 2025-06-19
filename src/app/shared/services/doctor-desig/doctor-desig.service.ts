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
const extraMockDoctors: CreateDoctorProfile[] = [
  {
    name: 'Dra. Isabel Ramírez',
    email: 'isabel.ramirez@clinicapp.com',
    birthdate: new Date('1984-01-12'),
    phone: '5566112233',
    address: 'Santa Fe, CDMX',
    role: UserRoleEnum.doctor,
    createdAt: new Date(),
    isActive: true,
    isFirstLogin: true,
    specialty: '1', // Pediatría
    dailyAppointments: 6,
    schechule: { start: '10:00', end: '16:00' }
  },
  {
    name: 'Dr. Esteban Lara',
    email: 'esteban.lara@clinicapp.com',
    birthdate: new Date('1980-02-14'),
    phone: '5544332211',
    address: 'San Jerónimo, CDMX',
    role: UserRoleEnum.doctor,
    createdAt: new Date(),
    isActive: true,
    isFirstLogin: true,
    specialty: '2', // Ginecología
    dailyAppointments: 7,
    schechule: { start: '08:00', end: '14:00' }
  },
  {
    name: 'Dra. Patricia Jiménez',
    email: 'patricia.jimenez@clinicapp.com',
    birthdate: new Date('1990-09-09'),
    phone: '5599887766',
    address: 'Tlalpan, CDMX',
    role: UserRoleEnum.doctor,
    createdAt: new Date(),
    isActive: true,
    isFirstLogin: true,
    specialty: '3', // Psicología
    dailyAppointments: 5,
    schechule: { start: '13:00', end: '19:00' }
  },
  {
    name: 'Dr. Roberto Aguilar',
    email: 'roberto.aguilar@clinicapp.com',
    birthdate: new Date('1977-05-18'),
    phone: '5522993344',
    address: 'Cuajimalpa, CDMX',
    role: UserRoleEnum.doctor,
    createdAt: new Date(),
    isActive: true,
    isFirstLogin: true,
    specialty: '4', // Cardiología
    dailyAppointments: 9,
    schechule: { start: '07:00', end: '13:00' }
  }
];



    
    // this.createMockDoctors(extraMockDoctors);
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

      return { doctor:null };
    }
  }
}
