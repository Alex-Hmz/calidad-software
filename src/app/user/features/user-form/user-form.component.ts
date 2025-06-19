import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/services/users/user.service';
import { CreateDoctorProfile, DoctorProfile, PatientProfile } from '../../../shared/models/users';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UserRoleEnum } from '../../../shared/models/enums';
import Swal from 'sweetalert2';
import { SpecialtyService } from '../../../shared/services/specialty-data-access/specialty.service';

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
    private authService: AuthService,
    public specialtyService: SpecialtyService
    
  ) {
    this.form = this.fb.group({
        name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthdate: [new Date(), Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],

      // Información médica
      specialty: ['', Validators.required],

      // Horario
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],

      dailyAppointments: ['', [Validators.required, Validators.min(1)]],

      // Credenciales de acceso
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, 
    { 
      validators: [
        this.horarioValidator,
        this.passwordMatchValidator,
        this.dailyAppointmentsValidator // <-- add new validator here
      ]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? null;
    console.log('ID from route:', this.id);
    
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
      dailyAppointments,
      startTime,
      endTime
    } = this.form.value;

    // Extra validation: dailyAppointments <= available hours
    if (startTime && endTime && dailyAppointments) {
      const [startHour] = startTime.split(':').map(Number);
      const [endHour] = endTime.split(':').map(Number);
      const maxAppointments = endHour - startHour;
      if (dailyAppointments > maxAppointments) {
        Swal.fire({
          title: "Citas diarias excedidas",
          text: "El número de citas diarias no puede ser mayor al número de horas seleccionadas.",
          icon: "warning"
        });
        return;
      }
    }

    try {

      let user: any;
      if(!this.editionMode){
        user = await this.authService.register(email, password, UserRoleEnum.doctor);
      }else{
        user = await this.authService.getUserProfile(this.id!); 
        console.log('User from auth service:', user);
        
      }
      

      if (user) {
        const doctorProfile: CreateDoctorProfile = {
          name,
          email,
          birthdate,
          phone,
          address,
          schechule:{
            start: this.form.value.startTime as string,
            end: this.form.value.endTime as string
          },
          dailyAppointments,
          role: UserRoleEnum.doctor, 
          specialty,
          createdAt: new Date(),
          isFirstLogin: true
        };

        const success = await this.authService.createUserProfile(this.id!, doctorProfile);
        if (success) {
          Swal.fire({
            title: "Registro exitoso",
            text: "El usuario fue registrado correctamente.",
            icon: "success"
          });
          this.success = 'Registro exitoso';
        } else {
          Swal.fire({
            title: "Error",
            text: "Error al crear el perfil del usuario",
            icon: "error"
          });
          this.error = 'Error al crear el perfil del usuario';
        }
      } else {
        Swal.fire({
          title: "Error",
          text: "Error al registrar el usuario",
          icon: "error"
        });
        this.error = 'Error al registrar el usuario';
      }
    }catch (error: any) {
      Swal.fire({
        title: "Error",
        text: "Error: " + error.message,
        icon: "error"
      });
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

  dailyAppointmentsValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    const dailyAppointments = group.get('dailyAppointments')?.value;

    if (!start || !end || !dailyAppointments) return null;

    // Parse hours from "HH:mm"
    const [startHour] = start.split(':').map(Number);
    const [endHour] = end.split(':').map(Number);

    const maxAppointments = endHour - startHour;
    if (maxAppointments <= 0) return { rangoHorarioInvalido: true };

    if (dailyAppointments > maxAppointments) {
      return { dailyAppointmentsExceed: true };
    }
    return null;
  };

  goBack() {
    this.router.navigate(['/appointment/list']);
  }
}
