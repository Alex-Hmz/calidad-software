import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DateConfigComponent } from './date-config.component';

const routes: Routes = [
  { path: '', component: DateConfigComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DateConfigRoutingModule {}
