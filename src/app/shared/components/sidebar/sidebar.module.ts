import { inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { DrawerModule } from 'primeng/drawer';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    DrawerModule,
    RouterModule 
  ],
  exports: [
    SidebarComponent
  ],
})
export class SidebarModule { }
