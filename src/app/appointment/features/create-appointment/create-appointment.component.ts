import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AppointmentService } from '../../../shared/services/appointments/appointment.service';
import { Auth, user } from '@angular/fire/auth';
import { CreateAppointment, CreateAsignDoctorToAppointment } from '../../models/appointment';
import { Router } from '@angular/router';
import { AppointmentStatusEnum } from '../../../shared/models/enums';
import { AppointmentTypeService } from '../../../shared/services/appointment-type-data-access/appointment-type.service';
import { CreateTrace, Trace } from '../../../shared/models/appointment-trace';
import { AppointmentTraceService } from '../../../shared/services/appointment-trace/appointment-trace.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { DoctorDesigService } from '../../../shared/services/doctor-desig/doctor-desig.service';

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
  tracings: Trace[] = [];


  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private auth: Auth,
    private router: Router,
    public appointmentTypeService: AppointmentTypeService,
    public appointmentTraceService: AppointmentTraceService,
    private authService: AuthService,
    private doctorDesigService: DoctorDesigService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      time: [null, Validators.required],
      typeId: [null, Validators.required],
      reason: ['', Validators.required],
      isStudy: [false],
      isTraced: [false],
      traceId: [null],
      isNewTrace: [false],
      traceName: [''], // título u objetivo general
      traceNotes: ['']
    });

    this.form.get('typeId')?.valueChanges.subscribe((isTraced: boolean) => {
      const id = this.form.get('typeId')?.value;
console.log(id);
      
    });

    this.form.get('isTraced')?.valueChanges.subscribe((isTraced: boolean) => {
      const traceIdControl = this.form.get('traceId');
      if (isTraced) {
        traceIdControl?.setValidators([Validators.required]);
      } else {
        traceIdControl?.clearValidators();
        traceIdControl?.setValue(null);
      }
      traceIdControl?.updateValueAndValidity();
    });

    this.form.get('isNewTrace')?.valueChanges.subscribe((isTraced: boolean) => {
      const traceNameControl = this.form.get('traceName');
      const traceNotesControl = this.form.get('traceNotes');
      const traceIdControl = this.form.get('traceId');

      if (isTraced) {
        traceIdControl?.disable();

        traceIdControl?.setValue(null);
        traceIdControl?.clearValidators();

        traceNameControl?.setValidators([Validators.required]);
        traceNotesControl?.setValidators([Validators.required]);
      } else {

        traceIdControl?.enable();

        traceNameControl?.clearValidators();
        traceNameControl?.setValue(null);

        traceNotesControl?.clearValidators();
        traceNotesControl?.setValue(null);
      }
      traceNameControl?.updateValueAndValidity();
      traceNotesControl?.updateValueAndValidity();
    });
  }

  async ngOnInit() {

    if(this.authService.getCurrentUserId()){
      const result = await this.appointmentTraceService.getAllByUser(this.authService.getCurrentUserId()! )
    }

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


    const { date, time, reason, typeId } = this.form.value;

    // Asegurarte de que date es string
    const formattedDate = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;


    const appointment: CreateAppointment = {
      userId: this.authService.getCurrentUserId()!,
      estado: AppointmentStatusEnum.Pendiente,
      date: formattedDate,
      time,
      typeId,
      reason,
      createdAt: Date.now()
    };

    const newTrace: CreateTrace = {
      userId: this.authService.getCurrentUserId()!,
      traceName: this.form.value.traceName ?? null,
      traceNotes: this.form.value.traceNotes ?? null,
      isValid: true
    }


    try {

      if(this.form.value.isTraced){
        appointment.traceId = this.form.value.traceId;
      }

      const specialtyIdOfType = this.appointmentTypeService.getSpecialtyIdByAppointmentTypeId(appointment.typeId);

      const assignDoctor: CreateAsignDoctorToAppointment = {
        userId: appointment.userId,
        typeId: specialtyIdOfType!,
        date: appointment.date,
        time: appointment.time
      }

      const doctorAvailability = await this.doctorDesigService.isDoctorAvailableToAppointment(assignDoctor);
      if(doctorAvailability.isAvailability){
        const appointmentId = await this.appointmentService.createAppointment(appointment);
        const result = await this.appointmentService.asignDoctorToAppointment(appointmentId, doctorAvailability.id)

        if(this.form.value.isNewTrace){
        
          appointment.traceId = await this.appointmentTraceService.create(newTrace);
          
        }
      alert('Cita agendada exitosamente');

      }else{
        alert('No existe disponibilidad a ese horario')
      }




      




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
        bookedHours = await this.appointmentService.getBookedHoursByUser(base.toISOString().split('T')[0], this.authService.getCurrentUserId()!);
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
