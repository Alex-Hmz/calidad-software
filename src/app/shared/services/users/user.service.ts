import { computed, Injectable, signal } from '@angular/core';
import { collection, CollectionReference, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { DoctorProfile, PatientProfile } from '../../models/users';
import { UserRoleEnum } from '../../models/enums';
import { Specialty } from '../../models/specialty';

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

    users = computed(() => this._state().users);
    loading = computed(() => this._state().loading);
    error = computed(() => this._state().error);

  async getUsers(): Promise<Boolean> {
    this._state.update((state) => ({
      ...state,
      loading: true,
      error: false
    }));
    try{
      
      const q = query(
      this.usersRef,
      where('role', '==', UserRoleEnum.doctor),
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as DoctorProfile))
      .filter(user => user.isActive === true);

      const specialtySnapshot = await getDocs(collection(this.firestore, 'specialties'));
      const specialtiesMap = new Map<string, string>();
      specialtySnapshot.forEach(doc => {
        const data = doc.data() as Specialty;
        specialtiesMap.set(doc.id, data.name);
      });

      const doctorsWithSpecialtyName = users.map(doc => ({
      ...doc,
      specialtyName: specialtiesMap.get(doc.specialty) || 'Sin especialidad'
      }));

      if(users){
        this._state.update((state) => ({
          ...state,
          users: doctorsWithSpecialtyName,
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

  async getUser(id: string, role:UserRoleEnum ): Promise<DoctorProfile | PatientProfile | undefined> {
    
    const docRef = doc(this.firestore, 'users', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

      switch(role){
        case UserRoleEnum.doctor :
          return { id: docSnap.id, ...docSnap.data() } as DoctorProfile;
        case UserRoleEnum.patient:
          return { id: docSnap.id, ...docSnap.data() } as PatientProfile

        default: return undefined
      }
    } else {
      return undefined;
    }
  }

  async getDoctorsBySpecialtyAndAvaility(specialty: string, time:string): Promise<DoctorProfile[]> {
   const result = await this.getUsers();
    if (!result) {
      throw new Error('Error al obtener los usuarios.');
    }

    const doctors = this._state().users.filter(user => 
      user.role === UserRoleEnum.doctor 
      &&
      // (user.schechule.start >= time && 
      // time <= user.schechule.end) 
      // &&
      user.specialty === specialty && 
      user.isActive 
    );

    if(doctors.length === 0){
      throw new Error('No se encontraron doctores disponibles con la especialidad y hora seleccionadas.');
    }
    return doctors;
  }
  
}
