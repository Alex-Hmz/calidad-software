import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentsRoutingModule } from './appointments-routing.module';
import { ButtonModule } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    AppointmentsComponent
  ],
  imports: [
    CommonModule,
    AppointmentsRoutingModule,
    ButtonModule,
    DataViewModule,
    Tag,
    DialogModule,
  ],
  exports: [
    AppointmentsComponent
  ],
})
export class AppointmentsModule { }
