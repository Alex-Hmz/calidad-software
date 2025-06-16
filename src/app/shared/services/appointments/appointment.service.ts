import { computed, Injectable, signal } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, CollectionReference, updateDoc, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Appointment, CreateAppointment } from '../../../appointment/models/appointment';
import { AppointmentStatusEnum, UserRoleEnum } from '../../models/enums';
import Swal from 'sweetalert2';

interface AppointmentState{
    future_appointments: Appointment[];
    current_appointments: Appointment[];
    historic_appointments: Appointment[];
    loading: boolean;
    error: boolean;        
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsRef: CollectionReference;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.appointmentsRef = collection(this.firestore, 'appointments');


// const medicalTests = [
//   { name: "Biometría Hemática", price: 100, specialtyId: "8coQoXzrZXayVTzLiLVV" }, // Medicina General
//   { name: "Examen General de Orina", price: 80, specialtyId: "8coQoXzrZXayVTzLiLVV" },
//   { name: "Prueba de Embarazo", price: 90, specialtyId: "IPHTUZ4TnlrOAnQRCvGu" }, // Ginecología
//   { name: "Papanicolau", price: 150, specialtyId: "IPHTUZ4TnlrOAnQRCvGu" },
//   { name: "Electrocardiograma", price: 200, specialtyId: "FA0exkPh8vWiqtCfPSeu" }, // Cardiología
//   { name: "Examen de la Vista", price: 80, specialtyId: "miD2MgSXvVe65SgabLkvu" }, // Oftalmología
//   { name: "Radiografía de Tórax", price: 300, specialtyId: "Kpmb0cy4UrtYuHxAiRYe" }, // Traumatología
//   { name: "Glucosa Capilar", price: 40, specialtyId: "I2onxp9VkLyQbxU6eAID" }, // Nutrición
//   { name: "Prueba COVID (rápida)", price: 100, specialtyId: "8coQoXzrZXayVTzLiLVV" }, // Medicina General
//   { name: "Perfil Lipídico", price: 200, specialtyId: "FA0exkPh8vWiqtCfPSeu" } // Cardiología
// ].map((item) => ({
//   ...item,
//   isValid: true,
//   createdAt: new Date(),
//   updatedAt: new Date()
// }));


//     medicalTests.forEach(async (data) => {
//       await addDoc(collection(this.firestore, "medicalTests"), data );
      
//     });

  }

    private _state = signal<AppointmentState>({
        future_appointments: [],
        current_appointments: [],
        historic_appointments: [],
        loading: false,
        error: false
    });

    current_appointments = computed(() => this._state().current_appointments);
    historic_appointments = computed(() => this._state().historic_appointments);
    future_appointments = computed(() => this._state().future_appointments);
    loading = computed(() => this._state().loading);
    error = computed(() => this._state().error);



  async getAppointmentsByUser(userId: string, role: UserRoleEnum): Promise<Boolean> {
    this._state.update((state) => ({
        ...state,
        loading: true,
        error: false
    }));

    try{
      
      const appointmentsRef = collection(this.firestore, 'appointments');
      let q = null;
      
      switch(role){

        case UserRoleEnum.patient : {
          q = query(appointmentsRef, where('userId', '==', userId));
          break;
        }
        case UserRoleEnum.doctor : {
          q = query(appointmentsRef, where('doctorId', '==', userId));
          break;
        }
        case UserRoleEnum.admin : {
          q = query(appointmentsRef);
          break;
        }
        default:{
          q = query(appointmentsRef, where('userId', '==', userId));
        }

      }

      const snapshot = await getDocs(q);
      const citas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

      const now = new Date();

      if(citas){
        // Helper to check if an appointment is in the current hour
        const isCurrentHour = (c: Appointment) => {
          const appointmentDate = new Date(`${c.date}T${c.time}`);
          const nowHour = now.getHours();
          const nowYear = now.getFullYear();
          const nowMonth = now.getMonth();
          const nowDate = now.getDate();
          return (
            appointmentDate.getFullYear() === nowYear &&
            appointmentDate.getMonth() === nowMonth &&
            appointmentDate.getDate() === nowDate &&
            appointmentDate.getHours() === nowHour
          );
        };

        this._state.update((state) => ({
          ...state,
          future_appointments: citas.filter(c => new Date(`${c.date}T${c.time}`) > now && c.estado !== 'Cancelada'),
          current_appointments: citas.filter(c => isCurrentHour(c) && (c.estado !== AppointmentStatusEnum.Cancelada && c.estado !== AppointmentStatusEnum.Realizada)),
          historic_appointments: citas.filter(c => new Date(`${c.date}T${c.time}`) < now || (c.estado === AppointmentStatusEnum.Cancelada || c.estado === AppointmentStatusEnum.Realizada)),
          loading: false,
          error: false
        }));
  
      }
      
      return true;

    }catch (error) {
      this._state.update((state) => ({
          ...state,
          error: true
      }));
      Swal.fire({
        title: "Error",
        text: "Error al obtener citas: " + (error as any).message,
        icon: "error"
      });
      return false;

    }finally {
      this._state.update((state) => ({
          ...state,
          loading: false
      }));
    }
  }

  async getBookedHoursByUser(date: string, userId:string):Promise<string[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('date', '==', date)
        , where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const citas = snapshot.docs.map(doc => doc.data() as Appointment);
      return citas.map(c => c.time); // ["09:00", "12:00", ...]
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: "Error al obtener las horas disponibles: " + (e as any).message,
        icon: "error"
      });
      return [];
    }
  }

  async createAppointment(appointment: CreateAppointment) {
    try {
        const docRef = await addDoc(this.appointmentsRef, appointment);
        return docRef.id;
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error al crear la cita: " + (error as any).message,
        icon: "error"
      });
      throw new Error((error as any).message);
    }
  }

  async updateAppointmentStatus(appointmentId: string, appointmentType:AppointmentStatusEnum): Promise<void> {
    const docRef = doc(this.firestore, 'appointments', appointmentId);
    try {
      Swal.fire({
        title: "Cita modificada",
        text: "Cita modificada exitosamente: " + appointmentType,
        icon: "success"
      });
      return await updateDoc(docRef, { estado: appointmentType });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error al actualizar el estado: " + (error as any).message,
        icon: "error"
      });
      throw new Error('Error al actualizar el estado: ' + (error as any).message);
    }
  }

  async getTotalAppointmentsByDoctorAndDate(doctorId: string, date: string): Promise<number> {
    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('date', '==', date)
    );

    return await getDocs(q).then(snapshot => {
      return snapshot.docs.length;
    }).catch(error => {

      throw new Error('Error al obtener citas: ' + (error as any).message);
    });
  }

  async getIsDoctorAvailableToAppointment(doctorId: string, date: string, time: string): Promise<boolean> {
    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('date', '==', date),
      where('time', '==', time)
    );

    return await getDocs(q)
    .then(snapshot => {
      return snapshot.docs.length === 0; // Si no hay citas, el doctor está disponible
    })
    .catch(error => {
      throw new Error('Error al verificar disponibilidad: ' + (error as any).message);
    });
  }
  async asignDoctorToAppointment(appointmentId: string, doctorId: string): Promise<void> {

        const appointmentRef = doc(this.appointmentsRef, appointmentId);
          return await updateDoc(appointmentRef, {
            doctorId,
            estado: AppointmentStatusEnum.Pendiente
          });

  }

  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    const docRef = doc(this.firestore, 'appointments', appointmentId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Appointment;
    }
    return null;
  }

}
