import { Injectable, signal } from '@angular/core';
import { collection, CollectionReference, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { DoctorProfile } from '../../shared/models/users';
import { UserRoleEnum } from '../../shared/models/enums';

interface userState{
    users: DoctorProfile[];
    loading: boolean;
    error: boolean;        
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private usersRef: CollectionReference;
  

  constructor(private firestore: Firestore) {
    this.usersRef = collection(this.firestore, 'users');
  }

    private _state = signal<userState>({
      users: [],
      loading: false,
      error: false
    });

  async obtenerUsuarios(): Promise<Boolean> {
        this._state.update((state) => ({
        ...state,
        loading: true,
        error: false
    }));
        try{
          
          const q = query(this.usersRef, where('role', '==', UserRoleEnum.doctor));
          const snapshot = await getDocs(q);
          const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoctorProfile));
    
          const now = new Date();
    
          if(users){
            this._state.update((state) => ({
              ...state,
              users: users,
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

  async obtenerUsuario(id: string): Promise<DoctorProfile | undefined> {
    
    const docRef = doc(this.firestore, 'users', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DoctorProfile;
    } else {
      return undefined;
    }
  }
}
