import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/services/users/user.service';
import { CreateDoctorProfile, DoctorProfile, PatientProfile } from '../../../shared/models/users';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UserRoleEnum } from '../../../shared/models/enums';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent {
 form: FormGroup;
  id: string | null = null;
  editionMode = false;
  today: Date = new Date(); // Para el calendario de fecha de nacimiento
  error = '';
  success = '';
  loading = false;
  availableTimes:{label:string, value:string}[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
        name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthdate: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],

      // Información médica
      specialty: ['', Validators.required],

      // Horario
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],

      dailyAppointments: ['', [Validators.required, Validators.min(1), Validators.max(9)]],

      // Credenciales de acceso
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, 
    { 
      validators: [
        this.horarioValidator,
       this.passwordMatchValidator]
     });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? null;
    this.editionMode = !!this.id;
    this.setAvailableTimes();

    if (this.editionMode) {
      this.userService.getUser(this.id!, UserRoleEnum.doctor)
        .then((usuario: DoctorProfile | PatientProfile | undefined) => {

          if (usuario && (usuario as DoctorProfile).specialty !== undefined) {
            const doctor = usuario as DoctorProfile;
            this.form.patchValue({
              name: doctor.name,
              email: doctor.email,
              birthdate: doctor.birthdate,
              phone: doctor.phone,
              address: doctor.address,
              specialty: doctor.specialty,
              startTime: doctor.schechule?.start,
              endTime: doctor.schechule?.end,
              dailyAppointments: doctor.dailyAppointments,
            });
          } else {
            console.error('Usuario no encontrado');
            this.router.navigate(['/usuarios']);
          }
        })
    }

    this.form.get('startTime')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity();      
    });
    this.form.get('endTime')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity();
    });
  }

  async submit(): Promise<void> {
   const { 
      email, 
      password, 
      name, 
      birthdate, 
      phone, 
      address, 
      specialty,
      dailyAppointments
    } = this.form.value;
    
    try {
      const user = await this.authService.register(email, password, UserRoleEnum.doctor);

      if (user) {
        const doctorProfile: CreateDoctorProfile = {
          name,
          email,
          birthdate,
          phone,
          address,
          schechule:{
            start: this.form.value.startTime as string, // Agregar hora de inicio
            end: this.form.value.endTime as string// Agregar hora de fin
          },
          dailyAppointments,
          role: UserRoleEnum.doctor, 
          specialty, // Agregar especialidad
          createdAt: new Date(),
          isFirstLogin: true
        };

        const success = await this.authService.createUserProfile(user.uid, doctorProfile);
        if (success) {
          this.success = 'Registro exitoso';
          // setTimeout(() => {
          // this.router.navigate(['/users/list']);
          // }, 2000);
        } else {
          this.error = 'Error al crear el perfil del usuario';
        }
      } else {
        this.error = 'Error al registrar el usuario';
      }
    }catch (error: any) {
      alert('Error: ' + error.message);
    }



    // if (this.editionMode) {
    //   this.userService.actualizarUsuario(this.idUsuario!, data).subscribe(() => {
    //     this.router.navigate(['/usuarios']);
    //   });
    // } else {
    //   this.userService.crearUsuario(data).subscribe(() => {
    //     this.router.navigate(['/usuarios']);
    //   });
    // }
  }

  setAvailableTimes() {
    let startHour = 9;
    this.availableTimes = [];
    for (let hour = startHour; hour < 18; hour++) {
      this.availableTimes.push({
        label: `${hour.toString().padStart(2, '0')}:00`,
        value: `${hour.toString().padStart(2, '0')}:00`
      });
    }
      
  }

  horarioValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    console.log("Validando horario start: ", start);
    console.log("Validando horario end: ", end);
    

    // Si alguno no está definido aún, no validar
    if (!start || !end) return null;

    // Comparación directa de cadenas tipo "HH:mm"
    if (start >= end) {
      return { rangoHorarioInvalido: true };
    }

    return null;
  };
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
}
