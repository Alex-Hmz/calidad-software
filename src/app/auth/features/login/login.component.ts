import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { AppointmentType } from '../../../shared/models/appointment-type';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  error = '';
  loading = false;
  submitted = false;
  rememberMe = false;
  returnUrl: string = '/appointment/list'; // Valor predeterminado
  private destroy$ = new Subject<void>();
  private firestore = inject(Firestore);

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    // Revisar el estado de autenticación SOLO UNA VEZ al inicializar
    // const currentUser = this.authService.getCurrentUser();
    // if (currentUser) {
    //   this.router.navigate(['/home']);
    // }
  }

  async ngOnInit(): Promise<void> {
    // Obtener el returnUrl de los parámetros de la URL o usar la ruta predeterminada
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/appointment/list';
    
const appointmentTypes: AppointmentType[] = [
  { id: "1", name: "Consulta por oído o garganta", price: 100, specialtyId: "1", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "Papanicolau", price: 150, specialtyId: "2", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "Revisión de manchas o lunares", price: 120, specialtyId: "3", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "4", name: "Terapia individual (1 hora)", price: 180, specialtyId: "4", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "5", name: "Control de vacunas", price: 90, specialtyId: "5", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "6", name: "Chequeo ginecológico", price: 130, specialtyId: "2", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "7", name: "Revisión y receta médica", price: 60, specialtyId: "6", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "8", name: "Revisión infantil", price: 80, specialtyId: "5", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "9", name: "Consulta nutricional inicial", price: 120, specialtyId: "7", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "10", name: "Terapia individual (30 mins)", price: 120, specialtyId: "4", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "11", name: "Examen de la vista", price: 80, specialtyId: "8", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "12", name: "Limpieza dental", price: 100, specialtyId: "9", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "13", name: "Revisión de rodilla/articulaciones", price: 150, specialtyId: "10", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "14", name: "Receta para lentes", price: 100, specialtyId: "8", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "15", name: "Consulta por acné", price: 130, specialtyId: "3", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "16", name: "Revisión con electrocardiograma", price: 250, specialtyId: "6", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "17", name: "Consulta general", price: 100, specialtyId: "6", isValid: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "18", name: "Revisión de caries", price: 100, specialtyId: "9", isValid: true, createdAt: new Date(), updatedAt: new Date() }
];
    // for (const item of appointmentTypes) {
    //   try {
    //     const ref = doc(this.firestore, 'appointmentType', item.id);
    //     await setDoc(ref, item);
    //     console.log(`✔️ Documento ${item.id} insertado`);
    //   } catch (err) {
    //     console.error(`❌ Error al insertar ${item.id}:`, err);
    //   }
    // }

    // No hacemos verificación de autenticación aquí para evitar el bucle
  }

  /**
   * Función que maneja el envío del formulario de login
   */
  async onSubmit() {
    this.submitted = true;
    
    // Detener si el formulario es inválido
    if (this.form.invalid) {
      return;
    }

    const { email, password, rememberMe } = this.form.value;
    this.loading = true;
    this.error = '';

    try {
      await this.authService.login(email, password, rememberMe);
      
      // Evitamos usar navigateAfterLogin y en su lugar vamos directamente a returnUrl
      this.router.navigateByUrl(this.returnUrl);
    } catch (err: any) {
      this.error = err.message;
      this.loading = false;
    }
  }

  /**
   * Navega a la página de registro
   */
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
  
  /**
   * Navega a la página de recuperación de contraseña
   */
  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  /**
   * Getter para facilitar el acceso a los controles del formulario
   */
  get f() { 
    return this.form.controls; 
  }

  ngOnDestroy(): void {
    // Completar todos los observables para evitar memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }
}