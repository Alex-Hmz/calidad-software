import { Injectable } from '@angular/core';
import { 
  Auth, 
  browserSessionPersistence, 
  browserLocalPersistence,
  createUserWithEmailAndPassword, 
  getAuth, 
  onAuthStateChanged, 
  setPersistence, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  authState
} from '@angular/fire/auth';
import { 
  doc, 
  Firestore, 
  setDoc, 
  getDoc,
  updateDoc, 
  Timestamp,
  serverTimestamp
} from '@angular/fire/firestore';
import { DoctorProfile, UserProfile } from '../../models/users';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { UserRoleEnum } from '../../models/enums';

/**
 * Interfaz para las credenciales del usuario autenticado
 */
export interface Credentials {
  uid: string;
  email: string | null;
  displayName: string | null;
  refreshToken?: string;
  profilePicture?: string;
  role: string | null;
  idCandidate?: string;
}

/**
 * Servicio de autenticación que proporciona funcionalidades para registro, inicio de sesión,
 * gestión de credenciales y estado de autenticación.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedInSubject.asObservable();
  
  private credentialsSubject = new BehaviorSubject<Credentials | null>(this.getStoredCredentials());
  public credentials$ = this.credentialsSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    // Monitorear el estado de autenticación
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        if (!this.getStoredCredentials()) {
          const userProfile = await this.getUserProfile(user.uid);
          if (userProfile) {
            const credentials: Credentials = {
              uid: user.uid,
              email: user.email,
              displayName: userProfile.name,
              refreshToken: user.refreshToken,
              role: userProfile.role,
            };
            
            this.setCredentials(credentials, true);
            this.loggedInSubject.next(true);
          } else {
            this.clearCredentials();
            this.loggedInSubject.next(false);
          }
        } else {
          this.loggedInSubject.next(true);
        }
      } else {
        this.clearCredentials();
        this.loggedInSubject.next(false);
      }
    });
  }

  /**
   * Registra un nuevo usuario con correo electrónico y contraseña
   */
  async register(email: string, password: string, role:UserRoleEnum): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      return result.user;
    } catch (error: any) {
      // Mejorar los mensajes de error
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Ya existe una cuenta con este correo electrónico');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña es muy débil. Debe tener al menos 6 caracteres');
      } else {
        throw new Error(`Error al crear la cuenta: ${error.message}`);
      }
    }
  }

  /**
   * Inicia sesión con correo electrónico y contraseña
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @param remember Si se debe recordar la sesión (persistencia local)
   */
  async login(email: string, password: string, remember: boolean = false): Promise<Credentials> {
    try {
      await this.changeSessionPersistence(remember);
      
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const user = result.user;
      
      if (!user) {
        throw new Error('No se pudo obtener la información del usuario');
      }
      
      // Obtener información adicional del usuario desde Firestore
      const userProfile = await this.getUserProfile(user.uid);
      
      if (!userProfile) {
        throw new Error('No se encontró el perfil del usuario');
      }
      
      // Verificar si el usuario tiene el rol requerido (si es necesario)
      // Por ejemplo, si solo permitimos candidatos:
      // if (userProfile.roleSlug !== 'candidate') {
      //   await this.logout();
      //   throw new Error('No tienes acceso');
      // }
      
      // Crear objeto de credenciales
      const credentials: Credentials = {
        uid: user.uid,
        email: user.email,
        displayName: userProfile.name,
        refreshToken: user.refreshToken,
        role: userProfile.role
      };
      
      // Actualizar la última vez que inició sesión
      await this.updateUserLastLogin(user.uid);
      
      // Guardar credenciales
      this.setCredentials(credentials, remember);
      
      return credentials;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No existe una cuenta con este correo electrónico');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos fallidos. Inténtalo más tarde');
      } else {
        throw new Error(`Error al iniciar sesión: ${error.message || 'Error desconocido'}`);
      }
    }
  }

  /**
   * Cambiar el tipo de persistencia de la sesión
   */
  private async changeSessionPersistence(remember: boolean): Promise<void> {
    const persistenceType = remember ? browserLocalPersistence : browserSessionPersistence;
    try {
      await setPersistence(this.auth, persistenceType);
    } catch (error: any) {
      console.error('Error al configurar la persistencia:', error);
      throw new Error(`Error al configurar la persistencia: ${error.message}`);
    }
  }

  /**
   * Crear o actualizar el perfil del usuario en Firestore
   */
  async createUserProfile(userId: string, profileData: UserProfile | DoctorProfile): Promise<boolean> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      
      // Añadir campos de auditoría
      const dataWithTimestamp = {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: profileData.createdAt ?? serverTimestamp()
      };
      
      await setDoc(userRef, dataWithTimestamp).then(() => {});
      return true;
    } catch (error: any) {
      throw new Error(`Error al crear el perfil del usuario: ${error.message}`);
    }
  }

  /**
   * Obtener el perfil del usuario desde Firestore
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error al obtener el perfil del usuario:', error);
      return null;
    }
  }

  /**
   * Actualizar la última vez que el usuario inició sesión
   */
  private async updateUserLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al actualizar la última vez de inicio de sesión:', error);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<boolean> {
    try {
      await signOut(this.auth);
      this.clearCredentials();
      this.router.navigate(['/auth/login'], { replaceUrl: true });
      return true;
    } catch (error: any) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return !!this.getStoredCredentials();
    // return !!this.auth.currentUser;

  }

  /**
   * Obtener las credenciales almacenadas
   */
  private getStoredCredentials(): Credentials | null {
    const savedCredentials = localStorage.getItem('credentials') || sessionStorage.getItem('credentials');
    if (savedCredentials) {
      try {
        return JSON.parse(savedCredentials);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Establecer las credenciales del usuario
   */
  private setCredentials(credentials: Credentials | null, remember: boolean = false): void {
    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('credentials', JSON.stringify(credentials));
      this.credentialsSubject.next(credentials);
      this.loggedInSubject.next(true);
    } else {
      this.clearCredentials();
    }
  }

  /**
   * Limpiar las credenciales del usuario
   */
  private clearCredentials(): void {
    localStorage.removeItem('credentials');
    sessionStorage.removeItem('credentials');
    this.credentialsSubject.next(null);
    this.loggedInSubject.next(false);
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): Credentials | null {
    return this.credentialsSubject.value;
  }

  get authState$(): Observable<User | null> {
    return authState(this.auth);
  }

  getCurrentRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.uid : null;

  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
  
}