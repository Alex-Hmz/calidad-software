import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../data-access/appointment.service';
import { Auth } from '@angular/fire/auth';
import { Appointment, AppointmentType, CreateAppointment } from '../../models/appointment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-appointment',
  standalone: false,
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.scss'
})
export class CreateAppointmentComponent {
  form: FormGroup;
  minDate: Date = new Date();
  availableTimes:{label:string, value:string}[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private auth: Auth,
    private router: Router,

  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      time: [null, Validators.required],
      reason: ['', Validators.required]
    });



  }

  ngOnInit() {

    this.setAvailableTimes();
    // Subscribe to date changes
    this.form.get('date')?.valueChanges.subscribe((selectedDate: Date | string) => {
      this.setAvailableTimes(selectedDate);
    });

  }

  async submit() {
    if (!this.auth.currentUser) {
      alert('Debes iniciar sesión para agendar una cita');
      return;
    }

    const { date, time, reason } = this.form.value;

    // Asegurarte de que date es string
    const formattedDate = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;


    const appointment: CreateAppointment = {
      userId: this.auth.currentUser.uid,
      estado: AppointmentType.Pendiente,
      date: formattedDate,
      time,
      reason,
      createdAt: Date.now()
    };

    try {
      await this.appointmentService.createAppointment(appointment);
      alert('Cita agendada exitosamente');
      this.form.reset();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  setAvailableTimes(selectedDate?: Date | string) {
      let base = new Date();
      if (selectedDate) {
        base = new Date(selectedDate);
      }

      const today = new Date();
      const isToday =
      base.getFullYear() === today.getFullYear() &&
      base.getMonth() === today.getMonth() &&
      base.getDate() === today.getDate();

      let startHour = 9;
      if (isToday) {
        const currentHour = today.getHours();
        startHour = Math.max(currentHour + 1, 9); //Sí es de madrugada, empieza a las 9
        if (currentHour >= 17) {
          startHour = 9; // No más citas por hoy
          this.minDate = new Date();
          this.minDate.setHours(0, 0, 0, 0);
          this.minDate.setDate(today.getDate() + 1);
        }
      }
      
      // const currentHour = base.getHours();
      this.availableTimes = [];
      for (let hour = startHour; hour < 18; hour++) {
        this.availableTimes.push({
          label: `${hour.toString().padStart(2, '0')}:00`,
          value: `${hour.toString().padStart(2, '0')}:00`
        });
      }
      
      // if(currentHour >= 9 && currentHour < 17) {
      //   base.setHours((currentHour + 1), 0, 0, 0);
      //   console.log(`En rango laboral: ${currentHour}`);
      // }

      // if(currentHour >= 17 || currentHour < 9) {
      //   base.setHours(9, 0, 0, 0);
      //   console.log(`Terminando el día zzz: ${currentHour}`);
      // }

      // if(currentHour >= 17) {
      //   this.minDate = new Date();
      //   this.minDate.setHours(0, 0, 0, 0);
      //   this.minDate.setDate(base.getDate() + 1);
      //   console.log(`Toca para el día siguiente: ${currentHour}`);
      // }

      // for (let hour = base.getHours(); hour < 18; hour++) {
      //   this.availableTimes.push({
      //     label: `${hour.toString().padStart(2, '0')}:00`,
      //     value: `${hour.toString().padStart(2, '0')}:00`
      //   });
      // }
  }
    
  goBack(){
    this.router.navigate(['/appointment/list']);
  }
}
