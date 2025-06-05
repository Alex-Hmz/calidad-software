import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../data-access/appointment.service';
import { Auth } from '@angular/fire/auth';
import { Appointment, CreateAppointment } from '../../models/appointment';
import { Router } from '@angular/router';
import { AppointmentStatusEnum } from '../../../shared/models/enums';
import { AppointmentTypeService } from '../../../shared/services/appointment-type-data-access/appointment-type.service';

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
    public appointmentTypeService: AppointmentTypeService,
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      time: [null, Validators.required],
      type: [null, Validators.required],
      reason: ['', Validators.required]
    });



  }

  ngOnInit() {

    this.setAvailableTimes(new Date());
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
      estado: AppointmentStatusEnum.Pendiente,
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

  async setAvailableTimes(selectedDate?: Date | string) {
      let base = new Date();
      let bookedHours: string[] = [];

      if (selectedDate) {
        base = new Date(selectedDate);
      }

    
      try{
        bookedHours = await this.appointmentService.getBookedHours(base.toISOString().split('T')[0]);
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
          if(!bookedHours.includes(`${hour.toString().padStart(2, '0')}:00`)){
            this.availableTimes.push({
              label: `${hour.toString().padStart(2, '0')}:00`,
              value: `${hour.toString().padStart(2, '0')}:00`
            });
          }
        }
      }catch(e){
        alert('Error al obtener las horas disponibles: ' + (e as any).message);
      }

      
  }
    
  goBack(){
    this.router.navigate(['/appointment/list']);
  }
}
