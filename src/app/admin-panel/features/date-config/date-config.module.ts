import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateConfigComponent } from './date-config.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DateConfigRoutingModule } from './appointments-routing.module';



@NgModule({
  declarations: [
    DateConfigComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DateConfigRoutingModule
  ],
  exports: [
    DateConfigComponent
  ],
})
export class DateConfigModule { }
