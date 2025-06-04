import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { UsersRoutingModule } from './users-routing.module';
import { ButtonModule } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { DataViewModule } from 'primeng/dataview';


@NgModule({
  declarations: [
    UsersComponent,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    ButtonModule,
    DataViewModule,
    Tag,
  ],
  exports: [
    UsersComponent
  ],
})
export class UsersModule { }
