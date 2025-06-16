import { computed, Injectable, signal } from '@angular/core';
import { collection, CollectionReference, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { AppointmentType } from '../../models/appointment-type';

interface AppointmentTypeState{
    types: AppointmentType[];
    loading: boolean;
    error: boolean;        
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentTypeService {

  private appointmentTypeRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.appointmentTypeRef = collection(this.firestore, 'appointmentType');
    this.getAll();
  }

  private _state = signal<AppointmentTypeState>({
    types: [],
    loading: false,
    error: false
  });

  types = computed(() => this._state().types);
  loading = computed(() => this._state().loading);
  error = computed(() => this._state().error);

  async getAll(): Promise<Boolean> {

    this._state.update((state) => ({
        ...state,
        loading: true,
        error: false
    }));

    try{
      
      const q = query(this.appointmentTypeRef, where('isValid', '==', true));
      const snapshot = await getDocs(q);
      const types = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppointmentType));
      
      if(types){
        this._state.update((state) => ({
          ...state,
          types,
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

  getSpecialtyIdByAppointmentTypeId(appointmentTypeId: string): string | null {
    const types = this._state().types;
    const match = types.find(type => type.id === appointmentTypeId);
    return match ? match.specialtyId : null;
  }

}
