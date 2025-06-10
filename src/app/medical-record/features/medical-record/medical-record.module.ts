import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalRecordComponent } from './medical-record.component';
import { MedicalRecordRoutingModule } from './medical-record-routing.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [
    MedicalRecordComponent
  ],
  imports: [
    CommonModule,
    MedicalRecordRoutingModule,
    ProgressSpinnerModule,
    DividerModule,
    TimelineModule,
    TableModule,
    TagModule
  ],
  exports: [
    MedicalRecordComponent
  ],
})
export class MedicalRecordModule { }
