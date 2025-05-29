import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateAppointmentComponent } from './create-appointment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { createAppointmentRoutingModule } from './create-appointment-routing.module';



@NgModule({
  declarations: [CreateAppointmentComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    createAppointmentRoutingModule
  ],
  exports: [CreateAppointmentComponent],
})
export class CreateAppointmentModule { }
