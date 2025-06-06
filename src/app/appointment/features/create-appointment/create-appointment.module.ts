import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateAppointmentComponent } from './create-appointment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { createAppointmentRoutingModule } from './create-appointment-routing.module';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [CreateAppointmentComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    createAppointmentRoutingModule,
    DatePickerModule,
    TextareaModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    InputTextModule
  ],
  exports: [CreateAppointmentComponent],
})
export class CreateAppointmentModule { }
