// src/app/auth/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [MessageService]
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  error = '';
  success = '';
  loading = false;
  today: Date = new Date(); // Para el calendario de fecha de nacimiento

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    // Inicializar el formulario con validaciones
    this.form = this.fb.group({
      // Datos personales
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      birthdate: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,10}$/)]],
      address: ['', [Validators.required]],
      
      // Información médica
      medicalConditions: [''],
      
      // Credenciales
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Configurar la fecha máxima como hoy para no permitir fechas futuras
    this.today = new Date();
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async register() {
    if (this.form.invalid) {
      // Marca todos los campos como tocados para mostrar los errores
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const { 
      email, 
      password, 
      name, 
      birthdate, 
      phone, 
      address, 
      insuranceNumber, 
      medicalConditions 
    } = this.form.value;
    
    this.loading = true;
    this.error = '';
    this.success = '';
    
    try {
      // Crear el usuario con email y contraseña
      const user = await this.authService.register(email, password);
      
      // Crear el perfil del usuario con la información adicional
      await this.authService.createUserProfile(user.uid, {
        name,
        email,
        birthdate,
        phone,
        address,
        medicalConditions,
        role: 'patient', // Asignamos el rol de paciente
        createdAt: new Date()
      });
      
      this.success = 'Registro exitoso';
      this.messageService.add({
        severity: 'success',
        summary: '¡Registro exitoso!',
        detail: 'Tu cuenta ha sido creada correctamente'
      });
      
      // Redirige al login después de un tiempo
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);

      // this.router.navigate(['/appointments']); // Redirige a la página de citas después del registro exitoso
      
    } catch (err: any) {
      this.error = err.message;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.error
      });
    } finally {
      this.loading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}