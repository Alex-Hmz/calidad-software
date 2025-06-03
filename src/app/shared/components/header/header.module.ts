import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

@NgModule({
  declarations: [HeaderComponent],
  imports: [
    CommonModule,
    ButtonModule,
    DrawerModule
  ],
  exports: [HeaderComponent],
})
export class HeaderModule { }
