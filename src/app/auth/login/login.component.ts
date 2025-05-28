import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  error = '';
  loading = false;
  submitted = false;
  rememberMe = false;
  returnUrl: string = '/home'; // Valor predeterminado
  private destroy$ = new Subject<void>();

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
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    // Obtener el returnUrl de los parámetros de la URL o usar la ruta predeterminada
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    
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
    this.router.navigate(['/register']);
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