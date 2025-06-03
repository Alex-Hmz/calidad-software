import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../data-access/user.service';
import { DoctorProfile } from '../../../shared/models/users';
import { AuthService } from '../../../auth/features/data-access/auth.service';
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
  modoEdicion = false;
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
    }, { validators: this.horarioValidator });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? null;
    this.modoEdicion = !!this.id;
    this.setAvailableTimes();

    if (this.modoEdicion) {
      this.userService.obtenerUsuario(this.id!)
        .then((usuario) => {
          if (usuario) {
            this.form.patchValue({
              name: usuario.name,
              email: usuario.email,
              birthdate: usuario.birthdate,
              phone: usuario.phone,
              address: usuario.address,
              specialty: usuario.specialty,
              startTime: usuario.schechule?.start,
              endTime: usuario.schechule?.end,
              dailyAppointments: usuario.dailyAppointments,
              // Password fields are intentionally left blank for security
            });
          } else {
            console.error('Usuario no encontrado');
            this.router.navigate(['/usuarios']);
          }
        })
    }

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
      const user = await this.authService.register(email, password);

      if (user) {
        const doctorProfile: DoctorProfile = {
          id: user.uid,
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
          createdAt: new Date()
        };

        const success = await this.authService.createUserProfile(user.uid, doctorProfile);
        if (success) {
          this.success = 'Registro exitoso';
          setTimeout(() => {
          this.router.navigate(['/users/list']);
          }, 2000);
        } else {
          this.error = 'Error al crear el perfil del usuario';
        }
      } else {
        this.error = 'Error al registrar el usuario';
      }
    }catch (error: any) {
      alert('Error: ' + error.message);
    }



    // if (this.modoEdicion) {
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
      // const currentHour = base.getHours();
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
    console.log("Validando horario:");
    console.log("Validando horario:", end);
    

    // Si alguno no está definido aún, no validar
    if (!start || !end) return null;

    // Comparación directa de cadenas tipo "HH:mm"
    if (start >= end) {
      return { rangoHorarioInvalido: true };
    }

    return null;
  };

}
