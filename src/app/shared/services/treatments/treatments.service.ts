import { Injectable, computed, signal } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, CollectionReference } from '@angular/fire/firestore';
import { Treatment, CreateTreatment, UpdateTreatment } from '../../models/treatments';
import Swal from 'sweetalert2';

interface TreatmentsState {
  treatments: Treatment[];
  loading: boolean;
  error: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TreatmentsService {
  private treatmentsRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.treatmentsRef = collection(this.firestore, 'treatments');
  }

  private _state = signal<TreatmentsState>({
    treatments: [],
    loading: false,
    error: false
  });

  treatments = computed(() => this._state().treatments);
  loading = computed(() => this._state().loading);
  error = computed(() => this._state().error);

  async getTreatmentsByUser(userId: string): Promise<boolean> {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: false
    }));

    try {
      const q = query(this.treatmentsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const treatments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Treatment));
      this._state.update(state => ({
        ...state,
        treatments,
        loading: false,
        error: false
      }));
      return true;
    } catch (error) {
      this._state.update(state => ({
        ...state,
        error: true,
        loading: false
      }));
      return false;
    }
  }

  async getTreatmentsByAppointment(appointmentId: string): Promise<Treatment[]> {
    const q = query(this.treatmentsRef, where('appointmentId', '==', appointmentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Treatment));
  }

  async getTreatmentById(treatmentId: string): Promise<Treatment | null> {
    
    const treatmentDoc = doc(this.firestore, 'treatments', treatmentId);
    const snapshot = await getDoc(treatmentDoc);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Treatment;
    }
    return null;
  }

  async getAllTreatments(): Promise<Treatment[]> {
    const snapshot = await getDocs(this.treatmentsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Treatment));
  }

  async createTreatment(treatment: CreateTreatment): Promise<string> {
    try {
      const docRef = await addDoc(this.treatmentsRef, treatment);
      Swal.fire({
        title: "Tratamiento creado",
        text: "Tratamiento creado correctamente.",
        icon: "success"
      });
      return docRef.id;
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: "Error al crear tratamiento: " + error.message,
        icon: "error"
      });
      throw error;
    }
  }

  async updateTreatment(update: UpdateTreatment): Promise<void> {
    try {
      const treatmentDoc = doc(this.firestore, 'treatments', update.id);
      const { id, ...data } = update;
      await updateDoc(treatmentDoc, { ...data, updatedAt: Date.now() });
      Swal.fire({
        title: "Tratamiento actualizado",
        text: "Tratamiento actualizado correctamente.",
        icon: "success"
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: "Error al actualizar tratamiento: " + error.message,
        icon: "error"
      });
      throw error;
    }
  }
}
