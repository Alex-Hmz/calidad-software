import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, CollectionReference } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Appointment } from '../models/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsRef: CollectionReference;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.appointmentsRef = collection(this.firestore, 'appointments');
  }

  async createAppointment(appointment: Appointment) {
    try {
      await addDoc(this.appointmentsRef, appointment);
    } catch (error) {
      throw new Error('Error al crear la cita: ' + (error as any).message);
    }
  }

  async getAppointmentsByUser(userId: string): Promise<{ actuales: Appointment[]; historico: Appointment[] }> {
    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(appointmentsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const citas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

    const now = new Date();

    const actuales = citas.filter(c => new Date(`${c.date}T${c.time}`) >= now);
    const historico = citas.filter(c => new Date(`${c.date}T${c.time}`) < now);

    return { actuales, historico };
  }
}
