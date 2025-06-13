import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorRegisterComponent } from './doctor-register.component';
import { DoctorRegisterRoutingModule } from './doctor-register-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';



@NgModule({
  declarations: [
    DoctorRegisterComponent
  ],
  imports: [
    CommonModule,
    DoctorRegisterRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
    InputNumberModule
  ]
})
export class DoctorRegisterModule { }
