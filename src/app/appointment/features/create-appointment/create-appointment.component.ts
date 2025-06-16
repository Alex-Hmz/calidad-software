import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AppointmentService } from '../../../shared/services/appointments/appointment.service';
import { Auth, user } from '@angular/fire/auth';
import { CreateAppointment, CreateAsignDoctorToAppointment } from '../../models/appointment';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentStatusEnum, UserRoleEnum } from '../../../shared/models/enums';
import { AppointmentTypeService } from '../../../shared/services/appointment-type-data-access/appointment-type.service';
import { CreateTrace, Trace } from '../../../shared/models/appointment-trace';
import { AppointmentTraceService } from '../../../shared/services/appointment-trace/appointment-trace.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { DoctorDesigService } from '../../../shared/services/doctor-desig/doctor-desig.service';
import { NotificationService } from '../../../shared/services/notification/notification.service';
import { AppointmentEmailParams } from '../../../shared/models/notifications';
import { UserService } from '../../../shared/services/users/user.service';
import { DoctorProfile, PatientProfile } from '../../../shared/models/users';
import { AdminPanelService, FreeDay } from '../../../shared/services/date-config/admin-panel.service';

@Component({
  selector: 'app-create-appointment',
  standalone: false,
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.scss'
})
export class CreateAppointmentComponent implements OnInit {
  form: FormGroup;
  minDate: Date = new Date();
  availableTimes:{label:string, value:string}[] = [];
  tracings: Trace[] = [];
  id: string | null = null;
  editionMode = false;
  patientInfo:PatientProfile = {
    id: '',
    role: UserRoleEnum.patient,
    name: '',
    email: '',
    birthdate: new Date(),
    phone: '',
    address: '',
    createdAt: new Date()
  };
  appointmentId: string | null = null;
  blockedDates: Date[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private auth: Auth,
    private router: Router,
    public appointmentTypeService: AppointmentTypeService,
    public appointmentTraceService: AppointmentTraceService,
    private authService: AuthService,
    private doctorDesigService: DoctorDesigService,
    private notificationService:NotificationService,
    private route: ActivatedRoute,
    private userService: UserService,
    private adminPanelService: AdminPanelService

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
    this.id = this.route.snapshot.paramMap.get('id') ?? null;
    this.editionMode = !!this.id;

    // If editing, fetch appointment by id and patch form
    if (this.editionMode && this.id) {
      const appointment = await this.appointmentService.getAppointmentById(this.id);
      if (appointment) {

        this.form.patchValue({
          date: new Date(appointment.date),
          time: appointment.time,
          typeId: appointment.typeId,
          reason: appointment.reason,
          // patch other fields as needed
        });
      }

    }else{
      this.id = this.authService.getCurrentUserId();
    }

    this.userService.getUser(this.id!, UserRoleEnum.patient)
      .then((usuario: DoctorProfile | PatientProfile | undefined) => {
        if (usuario && (usuario as PatientProfile)) {
          this.patientInfo = usuario as PatientProfile;
        }
      });


    const result = await this.appointmentTraceService.getAllByUser(this.id!);



    this.setAvailableTimes(new Date());
    this.form.get('date')?.valueChanges.subscribe((selectedDate: Date | string) => {
      this.setAvailableTimes(selectedDate);
    });

    // Fetch blocked days for the current year
    const year = new Date().getFullYear();
    const freeDays = await this.adminPanelService.getFreeDaysByYear(year);
    this.blockedDates = freeDays.map(fd => new Date(fd.date));
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
      userId: this.id!,
      estado: AppointmentStatusEnum.Pendiente,
      date: formattedDate,
      time,
      typeId,
      reason,
      createdAt: Date.now()
    };




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

      const doctorAvailable = await this.doctorDesigService.isDoctorAvailableToAppointment(assignDoctor);
      if(doctorAvailable !== null){
        if(this.form.value.isNewTrace){
          const newTrace: CreateTrace = {
            userId: this.id!,
            traceName: this.form.value.traceName ?? null,
            traceNotes: this.form.value.traceNotes ?? null,
            createAt: new Date(),
            isValid: true
          }
          appointment.traceId = await this.appointmentTraceService.create(newTrace);
          
        }
        const appointmentId = await this.appointmentService.createAppointment(appointment);
        const result = await this.appointmentService.asignDoctorToAppointment(appointmentId, doctorAvailable.doctor!.id)





        // Notificación Médico y usuario

      const email: AppointmentEmailParams = {
        to_name: this.patientInfo.name,
        to_email: this.patientInfo.email,
        to_cc: doctorAvailable.doctor?.email!,
        from_name: doctorAvailable.doctor?.name!,
        cita_fecha: appointment.date,
        cita_hora: appointment.time,
        accion: AppointmentStatusEnum.Pendiente,
        rol_actor: 'doctor',
        rol_receptor: 'paciente',
        razon_cancelacion: null,
        // to_cc: doctorAvailable.doctor?.email!,
        title: 'Pendiente de aceptación'
      }

      this.notificationService.send(email)
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
        bookedHours = await this.appointmentService.getBookedHoursByUser(base.toISOString().split('T')[0], this.id!);
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
