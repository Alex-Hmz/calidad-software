import { computed, Injectable, signal } from '@angular/core';
import { collection, CollectionReference, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { Specialty } from '../../models/specialty';

interface SpecialtyState{
    specialties: Specialty[];
    loading: boolean;
    error: boolean;        
}

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {

  private specialtiesRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.specialtiesRef = collection(this.firestore, 'specialties');
    // Do not call getAll() here, call it explicitly from your component after app init.
  }

  private _state = signal<SpecialtyState>({
    specialties: [],
    loading: false,
    error: false
  });

  specialties = computed(() => this._state().specialties);
  loading = computed(() => this._state().loading);
  error = computed(() => this._state().error);

  async getAll(): Promise<Boolean> {
    this._state.update((state) => ({
      ...state,
      loading: true,
      error: false
    }));

    try {
      // Remove all query filters for debugging
      const q = query(this.specialtiesRef, where('isValid', '==', true));
      const snapshot = await getDocs(q);
      const specialties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Specialty));

      if(specialties){
        this._state.update((state) => ({
          ...state,
          specialties,
          loading: false,
          error: false
        }));
      }


      return true;
    } catch (error) {

      this._state.update((state) => ({
        ...state,
        error: true
      }));
      console.error('Error fetching specialties:', error);
      return false;
    } finally {
      this._state.update((state) => ({
        ...state,
        loading: false
      }));
    }
  }
}

  
