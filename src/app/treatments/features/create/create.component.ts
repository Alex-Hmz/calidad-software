import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TreatmentsService } from '../../../shared/services/treatments/treatments.service';
import { CreateTreatment, UpdateTreatment, Treatment } from '../../../shared/models/treatments';
import { AppointmentService } from '../../../shared/services/appointments/appointment.service';
import { AppointmentStatusEnum } from '../../../shared/models/enums';

@Component({
  selector: 'app-create-treatment',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  standalone: false
})
export class CreateComponent implements OnInit {
  form: FormGroup;
  appointmentId: string | null = null;
  userId: string | null = null;
  treatmentId: string | null = null;
  loading = false;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private treatmentsService: TreatmentsService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    this.form = this.fb.group({
      treatmentName: ['', Validators.required],
      treatmentDescription: ['', Validators.required],
      treatmentDuration: [1, [Validators.required, Validators.min(1)]]
    });

    this.appointmentId = this.route.snapshot.paramMap.get('id');
    this.userId = this.route.snapshot.paramMap.get('userId');
  }

  async ngOnInit() {
    if (this.appointmentId) {
      this.loading = true;
      const treatments = await this.treatmentsService.getTreatmentsByAppointment(this.appointmentId);
      if (treatments && treatments.length > 0) {
        const treatment = treatments[0];
        this.isEdit = true;
        this.treatmentId = treatment.id;
        this.form.patchValue({
          treatmentName: treatment.treatmentName,
          treatmentDescription: treatment.treatmentDescription,
          treatmentDuration: treatment.treatmentDuration
        });
        this.userId = treatment.userId;
      }
      this.loading = false;
    }
  }

  async submit() {
    if (this.form.invalid || !this.appointmentId || !this.userId) {
      this.form.markAllAsTouched();
      alert('Faltan datos requeridos en la URL o el formulario.');
      return;
    }
    this.loading = true;

    if (this.isEdit && this.treatmentId) {
      // Update existing treatment
      const update: UpdateTreatment = {
        id: this.treatmentId,
        userId: this.userId,
        treatmentName: this.form.value.treatmentName,
        treatmentDescription: this.form.value.treatmentDescription,
        treatmentDuration: this.form.value.treatmentDuration,
        updatedAt: Date.now()
      };
      try {
        await this.treatmentsService.updateTreatment(update);
        alert('Tratamiento actualizado correctamente');
        this.form.reset();
      } catch (e: any) {
        alert('Error al actualizar tratamiento: ' + e.message);
      } finally {
        this.loading = false;
      }
    } else {
      // Create new treatment
      const treatment: CreateTreatment = {
        appointmentId: this.appointmentId,
        userId: this.userId,
        treatmentName: this.form.value.treatmentName,
        treatmentDescription: this.form.value.treatmentDescription,
        treatmentDuration: this.form.value.treatmentDuration,
        createdAt: Date.now()
      };
      try {
        await this.treatmentsService.createTreatment(treatment);
        await this.appointmentService.updateAppointmentStatus(
          this.appointmentId,
          AppointmentStatusEnum.Realizada
        );
        alert('Tratamiento creado correctamente y cita marcada como realizada');
        this.form.reset();
      } catch (e: any) {
        alert('Error al crear tratamiento o actualizar cita: ' + e.message);
      } finally {
        this.loading = false;
      }
    }
  }

  goBack() {
    this.router.navigate(['/appointment/list']);
  }
}
