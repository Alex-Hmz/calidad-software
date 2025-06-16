import { computed, Injectable, signal } from '@angular/core';
import { addDoc, collection, CollectionReference, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { CreateTrace, Trace } from '../../models/appointment-trace';

interface TraceState{
    traces: Trace[];
    loading: boolean;
    error: boolean;        
}


@Injectable({
  providedIn: 'root'
})
export class AppointmentTraceService {

  private taracesRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.taracesRef = collection(this.firestore, 'traces');
  }

    private _state = signal<TraceState>({
      traces: [],
      loading: false,
      error: false
    });

    traces = computed(() => this._state().traces);
    loading = computed(() => this._state().loading);
    error = computed(() => this._state().error);


    async getAllByUser(id:string): Promise<Boolean> {
  
      if(!id){
        throw new Error('User ID is required to fetch traces.');
      }
      this._state.update((state) => ({
          ...state,
          loading: true,
          error: false
      }));
  
      try{
        
        const q = query(this.taracesRef, 
          where('isValid', '==', true),
          where('userId', '==', id)
        );
        const snapshot = await getDocs(q);
        const traces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trace));
  
        const now = new Date();
  
        if(traces){
          this._state.update((state) => ({
            ...state,
            traces,
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

    async create(trace: CreateTrace): Promise<string> {
      try {
        const docRef = await addDoc(this.taracesRef, trace);
        return docRef.id;
      } catch (error) {
        throw new Error('Error al crear la cita: ' + (error as any).message);
      }
    }
}
