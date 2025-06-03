import { computed, Injectable, signal } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, CollectionReference, updateDoc, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Appointment, CreateAppointment } from '../models/appointment';
import { AppointmentStatusEnum } from '../../shared/models/enums';

interface AppointmentState{
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
  }

    private _state = signal<AppointmentState>({
        current_appointments: [],
        historic_appointments: [],
        loading: false,
        error: false
    });

    current_appointments = computed(() => this._state().current_appointments);
    historic_appointments = computed(() => this._state().historic_appointments);
    loading = computed(() => this._state().loading);
    error = computed(() => this._state().error);



  async getAppointmentsByUser(userId: string): Promise<Boolean> {

    this._state.update((state) => ({
        ...state,
        loading: true,
        error: false
    }));

    try{
      
      const appointmentsRef = collection(this.firestore, 'appointments');
      const q = query(appointmentsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const citas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

      const now = new Date();

      if(citas){
        this._state.update((state) => ({
          ...state,
          current_appointments: citas.filter(c => new Date(`${c.date}T${c.time}`) >= now && c.estado !== 'Cancelada'),
          historic_appointments: citas.filter(c => new Date(`${c.date}T${c.time}`) < now || c.estado !== 'Pendiente'),
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

      return false;

    }finally {
      this._state.update((state) => ({
          ...state,
          loading: false
      }));
    }
  }

  async createAppointment(appointment: CreateAppointment) {
    try {
      await addDoc(this.appointmentsRef, appointment);
    } catch (error) {
      throw new Error('Error al crear la cita: ' + (error as any).message);
    }
  }

  async updateAppointmentStatus(appointmentId: string, appointmentType:AppointmentStatusEnum): Promise<void> {
    const docRef = doc(this.firestore, 'appointments', appointmentId);
    try {
      alert('Cita modificada exitosamente: ' + appointmentType);
      return await updateDoc(docRef, { estado: appointmentType });
    } catch (error) {
      throw new Error('Error al actualizar el estado: ' + (error as any).message);
    }
  }
}
